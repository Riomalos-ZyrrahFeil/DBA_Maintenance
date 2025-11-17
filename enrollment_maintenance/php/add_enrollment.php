<?php
include '../../db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$student_id      = $data['student_id'] ?? '';
$enrollment_type = $data['enrollment_type'] ?? 'Regular';
// Note: When Regular is selected, $section_id is just one entry from the block, 
// but we need the Section Code/Year/Term to find the rest of the block.
$selected_section_id = $data['section_id'] ?? ''; 
$date_enrolled   = $data['date_enrolled'] ?? '';
$status          = $data['status'] ?? 'Enrolled';
$letter_grade    = $data['letter_grade'] ?? '';

// Basic Validation
if (empty($student_id) || empty($selected_section_id) || empty($date_enrolled) || empty($status)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields (student, section, date, status)."]);
    exit;
}

// Start Transaction
$conn->begin_transaction();
$success = true;
$message = "Enrollment processed successfully.";
$sections_to_enroll = [];

try {
    if ($enrollment_type === 'Regular') {
        // =========================================================
        // 1. REGULAR ENROLLMENT: FIND THE ENTIRE BLOCK
        // =========================================================

        // Get the identifying details (Section Code, Year, Term) from the ONE selected section
        $stmt = $conn->prepare("SELECT section_code, year, term_id FROM tbl_section WHERE section_id = ? AND is_deleted = 0");
        $stmt->bind_param("i", $selected_section_id);
        $stmt->execute();
        $block_details_result = $stmt->get_result();
        $block_details = $block_details_result->fetch_assoc();
        $stmt->close();

        if (!$block_details) {
            throw new Exception("Selected section not found or is deleted.");
        }

        // Find ALL section_ids that belong to this block
        $stmt_block = $conn->prepare("
            SELECT section_id, course_id FROM tbl_section 
            WHERE section_code = ? AND year = ? AND term_id = ? AND is_deleted = 0
        ");
        $stmt_block->bind_param("sii", $block_details['section_code'], $block_details['year'], $block_details['term_id']);
        $stmt_block->execute();
        $sections_to_enroll = $stmt_block->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt_block->close();

        if (empty($sections_to_enroll)) {
            throw new Exception("No courses found for the specified block section.");
        }

    } else {
        // =========================================================
        // 2. IRREGULAR ENROLLMENT: SINGLE SELECTED SECTION
        // =========================================================

        // Get course_id for prerequisite check
        $stmt_course = $conn->prepare("SELECT course_id FROM tbl_section WHERE section_id = ? AND is_deleted = 0");
        $stmt_course->bind_param("i", $selected_section_id);
        $stmt_course->execute();
        $course_id = $stmt_course->get_result()->fetch_assoc()['course_id'] ?? null;
        $stmt_course->close();

        if (!$course_id) {
            throw new Exception("Course not found for the selected section.");
        }

        $sections_to_enroll[] = ['section_id' => $selected_section_id, 'course_id' => $course_id];
    }
    
    // =========================================================
    // 3. PREREQUISITE CHECK & INSERTION LOOP (Applies to all courses being enrolled)
    // =========================================================
    
    $insert_stmt = $conn->prepare("INSERT INTO tbl_enrollment (student_id, enrollment_type, section_id, date_enrolled, status, letter_grade) VALUES (?, ?, ?, ?, ?, ?)");
    
    foreach ($sections_to_enroll as $section) {
        $section_id = $section['section_id'];
        $target_course_id = $section['course_id'];
        
        // --- PREREQUISITE CHECK (Standard logic from previous step) ---
        // Note: We enforce this logic here for every course, regardless of type,
        // as Irregular students should not enroll if they haven't passed the core prerequisite.
        
        // 1. Get the Prerequisite Course IDs for the target course
        $stmt_prereqs = $conn->prepare("
            SELECT c.course_code, cp.prereq_course_id
            FROM tbl_course_prerequisite cp
            INNER JOIN tbl_course c ON cp.prereq_course_id = c.course_id
            WHERE cp.course_id = ? AND cp.is_deleted = 0
        ");
        $stmt_prereqs->bind_param("i", $target_course_id);
        $stmt_prereqs->execute();
        $prerequisites = $stmt_prereqs->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt_prereqs->close();

        // 2. Check if the student has passed ALL prerequisites for this course
        foreach ($prerequisites as $prereq) {
            $prereq_course_id = $prereq['prereq_course_id'];
            $prereq_course_code = $prereq['course_code'];

            $stmt_passed = $conn->prepare("
                SELECT enrollment_id 
                FROM tbl_enrollment e
                INNER JOIN tbl_section s ON e.section_id = s.section_id
                WHERE e.student_id = ? 
                  AND s.course_id = ? 
                  AND e.status = 'Completed' 
                  AND e.letter_grade IS NOT NULL 
                  AND e.letter_grade != ''
                  AND e.is_deleted = 0
            ");
            $stmt_passed->bind_param("ii", $student_id, $prereq_course_id);
            $stmt_passed->execute();
            $is_passed = $stmt_passed->get_result()->num_rows > 0;
            $stmt_passed->close();

            if (!$is_passed) {
                // If any course in the block fails the prerequisite check, abort the entire transaction.
                throw new Exception("Prerequisite failed for course: " . $prereq_course_code);
            }
        }
        // --- END PREREQUISITE CHECK ---

        // Proceed with insertion for the current section_id
        $insert_stmt->bind_param("isssss", $student_id, $enrollment_type, $section_id, $date_enrolled, $status, $letter_grade);
        
        if (!$insert_stmt->execute()) {
            throw new Exception("Failed to enroll into section ID " . $section_id . ": " . $insert_stmt->error);
        }
    }
    
    $insert_stmt->close();
    
    // If the loop completes successfully, commit the entire block enrollment.
    $conn->commit();

} catch (Exception $e) {
    $success = false;
    $message = $e->getMessage();
    $conn->rollback();
}

$conn->close();

if ($success) {
    echo json_encode(["status" => "success", "message" => $message]);
} else {
    echo json_encode(["status" => "error", "message" => "Enrollment failed. " . $message]);
}
?>
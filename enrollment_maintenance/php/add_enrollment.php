<?php
include '../../db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$student_id      = $data['student_id'] ?? '';
$enrollment_type = $data['enrollment_type'] ?? 'Regular';
$selected_section_id = $data['section_id'] ?? ''; 
$date_enrolled   = $data['date_enrolled'] ?? '';
$status          = $data['status'] ?? 'Enrolled';
$letter_grade    = $data['letter_grade'] ?? '';

if (empty($student_id) || empty($selected_section_id) || empty($date_enrolled) || empty($status)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields (student, section, date, status)."]);
    exit;
}

$conn->begin_transaction();
$success = true;
$message = "Enrollment processed successfully.";
$sections_to_enroll = [];

try {
    if ($enrollment_type === 'Regular') {
        $stmt = $conn->prepare("SELECT section_code, year, term_id FROM tbl_section WHERE section_id = ? AND is_deleted = 0");
        $stmt->bind_param("i", $selected_section_id);
        $stmt->execute();
        $block_details_result = $stmt->get_result();
        $block_details = $block_details_result->fetch_assoc();
        $stmt->close();

        if (!$block_details) {
            throw new Exception("Selected section not found or is deleted.");
        }

        $stmt_block = $conn->prepare("
            SELECT section_id, course_id FROM tbl_section 
            WHERE section_code = ? AND year = ? AND term_id = ? AND is_deleted = 0
        ");
        $stmt_block->bind_param("sii", $block_details['section_code'], $block_details['year'], $block_details['term_id']);
        $stmt_block->execute();
        $sections_to_enroll = $stmt_block->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt_block->close();

        if (empty($sections_to_enroll)) {
            throw new Exception("No courses found for the specified block section: " . $block_details['section_code']);
        }

    } else {
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
    
    $insert_stmt = $conn->prepare("INSERT INTO tbl_enrollment (student_id, enrollment_type, section_id, date_enrolled, status, letter_grade) VALUES (?, ?, ?, ?, ?, ?)");
    
    $inserted_count = 0;
    foreach ($sections_to_enroll as $section) {
        $section_id = $section['section_id'];
        $insert_stmt->bind_param("isssss", $student_id, $enrollment_type, $section_id, $date_enrolled, $status, $letter_grade);
        
        if (!$insert_stmt->execute()) {
            throw new Exception("Failed to enroll into section ID " . $section_id . ": " . $insert_stmt->error);
        }
        $inserted_count++;
    }
    
    $insert_stmt->close();
    $conn->commit();
    $message = ($enrollment_type === 'Regular') 
               ? "Regular enrollment successful. Inserted $inserted_count courses."
               : "Irregular enrollment successful.";

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
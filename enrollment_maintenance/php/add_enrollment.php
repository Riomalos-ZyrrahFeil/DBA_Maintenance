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
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit;
}

$conn->begin_transaction();
$success = true;
$message = "";
$sections_to_enroll = [];

try {
    if ($enrollment_type === 'Regular') {
        $stmt = $conn->prepare("SELECT section_code, year, term_id FROM tbl_section WHERE section_id = ? AND is_deleted = 0");
        $stmt->bind_param("i", $selected_section_id);
        $stmt->execute();
        $block_details = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$block_details) throw new Exception("Selected section not found.");

        $stmt_block = $conn->prepare("SELECT section_id, course_id FROM tbl_section WHERE section_code = ? AND year = ? AND term_id = ? AND is_deleted = 0");
        $stmt_block->bind_param("sii", $block_details['section_code'], $block_details['year'], $block_details['term_id']);
        $stmt_block->execute();
        $sections_to_enroll = $stmt_block->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt_block->close();
    } else {
        $stmt_course = $conn->prepare("SELECT course_id FROM tbl_section WHERE section_id = ? AND is_deleted = 0");
        $stmt_course->bind_param("i", $selected_section_id);
        $stmt_course->execute();
        $course_id = $stmt_course->get_result()->fetch_assoc()['course_id'] ?? null;
        $stmt_course->close();

        if (!$course_id) throw new Exception("Course not found for the selected section.");
        $sections_to_enroll[] = ['section_id' => $selected_section_id, 'course_id' => $course_id];
    }

    foreach ($sections_to_enroll as $section) {
        $cid = $section['course_id'];

        $prereq_check = $conn->prepare("SELECT prereq_course_id FROM tbl_course_prereq WHERE course_id = ?");
        $prereq_check->bind_param("i", $cid);
        $prereq_check->execute();
        $prereq_res = $prereq_check->get_result();

        while ($prereq_row = $prereq_res->fetch_assoc()) {
            $req_id = $prereq_row['prereq_course_id'];

            $passed_check = $conn->prepare("
                SELECT COUNT(*) FROM tbl_enrollment e
                JOIN tbl_section s ON e.section_id = s.section_id
                WHERE e.student_id = ? AND s.course_id = ? 
                AND e.letter_grade IN ('A', 'B', 'C') AND e.is_deleted = 0
            ");
            $passed_check->bind_param("ii", $student_id, $req_id);
            $passed_check->execute();
            $has_passed = $passed_check->get_result()->fetch_row()[0];
            $passed_check->close();

            if ($has_passed == 0) {
                $c_stmt = $conn->query("SELECT course_code FROM tbl_course WHERE course_id = $req_id");
                $c_code = $c_stmt->fetch_assoc()['course_code'] ?? "Required Course";
                throw new Exception("Prerequisite Error: Student must pass $c_code before enrolling.");
            }
        }
        $prereq_check->close();
    }

    $insert_stmt = $conn->prepare("INSERT INTO tbl_enrollment (student_id, enrollment_type, section_id, date_enrolled, status, letter_grade) VALUES (?, ?, ?, ?, ?, ?)");
    
    $inserted_count = 0;
    foreach ($sections_to_enroll as $section) {
        $sid = $section['section_id'];
        $insert_stmt->bind_param("isssss", $student_id, $enrollment_type, $sid, $date_enrolled, $status, $letter_grade);
        if (!$insert_stmt->execute()) throw new Exception("Insertion failed.");
        $inserted_count++;
    }
    
    $insert_stmt->close();
    $conn->commit();
    $message = "Enrollment successful. $inserted_count courses processed.";

} catch (Exception $e) {
    $success = false;
    $message = $e->getMessage();
    $conn->rollback();
}

$conn->close();
echo json_encode(["status" => $success ? "success" : "error", "message" => $message]);
?>
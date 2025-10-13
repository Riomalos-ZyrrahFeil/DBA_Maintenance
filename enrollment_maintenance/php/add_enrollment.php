<?php
include '../../db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$student_id    = $data['student_id'] ?? '';
$section_id    = $data['section_id'] ?? '';
$date_enrolled = $data['date_enrolled'] ?? '';
$status        = $data['status'] ?? '';
$letter_grade  = $data['letter_grade'] ?? '';

if ($student_id && $section_id && $date_enrolled && $status) {
    $stmt = $conn->prepare("INSERT INTO tbl_enrollment (student_id, section_id, date_enrolled, status, letter_grade) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("iisss", $student_id, $section_id, $date_enrolled, $status, $letter_grade);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Enrollment added successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to add enrollment."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
}
?>

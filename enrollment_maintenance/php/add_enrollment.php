<?php
include '../../db.php';

$data = json_decode(file_get_contents('php://input'), true);

$date_enrolled = $data['date_enrolled'] ?? '';
$status = $data['status'] ?? '';
$letter_grade = $data['letter_grade'] ?? '';

if ($date_enrolled && $status && $letter_grade) {
    $stmt = $conn->prepare("INSERT INTO tbl_enrollment (date_enrolled, status, letter_grade) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $date_enrolled, $status, $letter_grade);

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

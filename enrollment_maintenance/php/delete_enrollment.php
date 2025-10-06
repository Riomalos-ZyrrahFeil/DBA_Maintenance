<?php
include '../../db.php';

$enrollment_id = $_GET['id'] ?? '';

if ($enrollment_id) {
    $stmt = $conn->prepare("DELETE FROM tbl_enrollment WHERE enrollment_id = ?");
    $stmt->bind_param("i", $enrollment_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Enrollment deleted successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete enrollment."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Missing enrollment ID."]);
}
?>

<?php
include '../../db.php';

$enrollment_id = $_GET['id'] ?? '';

if ($enrollment_id) {
    // Soft delete: set is_deleted = 1
    $stmt = $conn->prepare("UPDATE tbl_enrollment SET is_deleted = 1 WHERE enrollment_id = ?");
    $stmt->bind_param("i", $enrollment_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Enrollment deleted successfully (soft delete)."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete enrollment."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Missing enrollment ID."]);
}
?>

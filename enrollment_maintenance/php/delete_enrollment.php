<?php
include '../../db.php';
header('Content-Type: application/json');

$id = isset($_GET['id']) ? intval($_GET['id']) : null;

if ($id) {
    // 🆕 Soft Delete implementation: Sets is_deleted flag to 1
    $stmt = $conn->prepare("UPDATE tbl_enrollment SET is_deleted = 1 WHERE enrollment_id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Record soft-deleted successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to soft-delete record: " . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Missing Enrollment ID."]);
}

$conn->close();
?>
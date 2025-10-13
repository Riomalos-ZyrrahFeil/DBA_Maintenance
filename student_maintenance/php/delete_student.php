<?php
include '../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;

if (!$id) {
    echo "Invalid student ID.";
    exit;
}

// Instead of DELETE, just mark as deleted
$sql = "UPDATE tbl_student SET is_deleted = 1 WHERE student_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo "Student marked as deleted successfully!";
} else {
    echo "Error marking student as deleted.";
}

$stmt->close();
$conn->close();
?>

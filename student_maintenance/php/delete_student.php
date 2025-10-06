<?php
include '../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];
$sql = "DELETE FROM tbl_student WHERE student_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

echo $stmt->execute() ? "Deleted successfully!" : "Error deleting.";
?>

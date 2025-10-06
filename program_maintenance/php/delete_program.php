<?php
include '../../db.php';
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];

$sql = "DELETE FROM tbl_program WHERE program_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
  echo json_encode(["message" => "Program deleted successfully!"]);
} else {
  echo json_encode(["message" => "Failed to delete program."]);
}

$stmt->close();
$conn->close();
?>

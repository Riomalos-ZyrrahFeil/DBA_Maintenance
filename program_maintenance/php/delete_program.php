<?php
include '../../db.php';
header("Content-Type: application/json");

// Get the program ID from the request
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['program_id'] ?? null;

if (!$id) {
    echo json_encode(["message" => "No program ID provided."]);
    exit;
}

// Soft delete: set is_deleted = 1
$sql = "UPDATE tbl_program SET is_deleted = 1 WHERE program_id = ?";
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

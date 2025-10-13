<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);
$room_id = $data['room_id'] ?? '';

if (empty($room_id)) {
    echo json_encode(["status" => "error", "message" => "Room ID is required."]);
    exit;
}

// Soft delete: set is_delete = 1
$stmt = $conn->prepare("UPDATE tbl_room SET is_delete = 1 WHERE room_id = ?");
$stmt->bind_param("i", $room_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Room deleted successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>

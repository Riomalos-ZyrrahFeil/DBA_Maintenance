<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

$room_id   = $data['room_id'] ?? '';
$room_code = $data['room_code'] ?? '';
$capacity  = $data['capacity'] ?? '';
$building  = $data['building'] ?? '';

// Validate input
if (empty($room_id) || empty($room_code) || empty($capacity) || empty($building)) {
    echo json_encode(["status" => "error", "message" => "All fields are required."]);
    exit;
}

// Update record using prepared statement
$stmt = $conn->prepare("UPDATE tbl_room SET room_code = ?, capacity = ?, building = ? WHERE room_id = ?");
$stmt->bind_param("sisi", $room_code, $capacity, $building, $room_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Room updated successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>

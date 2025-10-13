<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

$room_code = $data['room_code'] ?? '';
$capacity  = $data['capacity'] ?? '';
$building  = $data['building'] ?? '';

if (empty($room_code) || empty($capacity) || empty($building)) {
    echo json_encode(["status" => "error", "message" => "All fields are required."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO tbl_room (room_code, capacity, building) VALUES (?, ?, ?)");
$stmt->bind_param("sis", $room_code, $capacity, $building);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Room added successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$stmt->close();
$conn->close();

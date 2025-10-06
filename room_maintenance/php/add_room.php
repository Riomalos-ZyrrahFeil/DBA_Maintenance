<?php
include '../../db.php';

$room_code = $_POST['room_code'];
$capacity = $_POST['capacity'];
$building = $_POST['building'];

$sql = "INSERT INTO tbl_room (room_code, capacity, building) VALUES ('$room_code', '$capacity', '$building')";
if ($conn->query($sql)) {
    echo json_encode(['status' => 'success', 'message' => 'Room added successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
}
?>

<?php
include '../../db.php';

$room_id = $_POST['room_id'];
$room_code = $_POST['room_code'];
$capacity = $_POST['capacity'];
$building = $_POST['building'];

$sql = "UPDATE tbl_room SET room_code='$room_code', capacity='$capacity', building='$building' WHERE room_id='$room_id'";
if ($conn->query($sql)) {
    echo json_encode(['status' => 'success', 'message' => 'Room updated successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
}
?>

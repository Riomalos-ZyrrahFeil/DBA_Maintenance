<?php
include '../../db.php';

$room_id = $_POST['room_id'];

$sql = "DELETE FROM tbl_room WHERE room_id='$room_id'";
if ($conn->query($sql)) {
    echo json_encode(['status' => 'success', 'message' => 'Room deleted successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
}
?>

<?php
include '../../db.php';
header('Content-Type: application/json');

$sql = "SELECT room_id, room_code FROM tbl_room";
$result = $conn->query($sql);
$rooms = [];

if($result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $rooms[] = $row;
    }
}

echo json_encode($rooms);
$conn->close();
?>

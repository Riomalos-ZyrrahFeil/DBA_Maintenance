<?php
include '../../db.php';

if(isset($_GET['room_id'])){
    $id = $_GET['room_id'];
    $sql = "SELECT * FROM tbl_room WHERE room_id='$id'";
    $result = $conn->query($sql);
    echo json_encode($result->fetch_assoc());
} else {
    $sql = "SELECT * FROM tbl_room";
    $result = $conn->query($sql);
    $rooms = [];
    while($row = $result->fetch_assoc()) {
        $rooms[] = $row;
    }
    echo json_encode($rooms);
}
?>

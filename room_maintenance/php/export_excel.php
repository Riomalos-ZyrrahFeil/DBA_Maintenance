<?php
include '../../db.php';
header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=rooms.xls");

$sql = "SELECT * FROM tbl_room";
$result = $conn->query($sql);

echo "Room Id\tRoom Code\tCapacity\tBuilding\n";
while($row = $result->fetch_assoc()) {
    echo "{$row['room_id']}\t{$row['room_code']}\t{$row['capacity']}\t{$row['building']}\n";
}
?>

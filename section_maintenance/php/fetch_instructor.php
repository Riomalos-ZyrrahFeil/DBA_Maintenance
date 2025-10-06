<?php
include '../../db.php';
header('Content-Type: application/json');

$sql = "SELECT instructor_id, CONCAT(last_name, ', ', first_name) AS instructor_name FROM tbl_instructor";
$result = $conn->query($sql);
$instructors = [];

if($result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $instructors[] = $row;
    }
}
echo json_encode($instructors);
$conn->close();
?>

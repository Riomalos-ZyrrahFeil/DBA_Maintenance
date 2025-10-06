<?php
include '../../db.php';
header('Content-Type: application/json');

$sql = "SELECT term_id, term_code FROM tbl_term";
$result = $conn->query($sql);
$terms = [];

if($result->num_rows > 0){
    while($row = $result->fetch_assoc()){
        $terms[] = $row;
    }
}
echo json_encode($terms);
$conn->close();
?>

<?php
include '../../db.php';

$result = $conn->query("SELECT * FROM tbl_term ORDER BY term_id DESC");
$terms = [];

while($row = $result->fetch_assoc()){
    $terms[] = $row;
}

echo json_encode($terms);
?>

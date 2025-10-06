<?php
include '../../db.php';

$term_code = $_POST['term_code'] ?? '';
$start_date = $_POST['start_date'] ?? '';
$end_date = $_POST['end_date'] ?? '';

$stmt = $conn->prepare("INSERT INTO tbl_term (term_code, start_date, end_date) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $term_code, $start_date, $end_date);

if($stmt->execute()){
    echo json_encode(["status"=>"success"]);
} else {
    echo json_encode(["status"=>"error", "message"=>$stmt->error]);
}
?>

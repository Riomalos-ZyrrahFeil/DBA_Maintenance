<?php
include '../../db.php';

$term_id = $_POST['term_id'] ?? '';
$term_code = $_POST['term_code'] ?? '';
$start_date = $_POST['start_date'] ?? '';
$end_date = $_POST['end_date'] ?? '';

$stmt = $conn->prepare("UPDATE tbl_term SET term_code=?, start_date=?, end_date=? WHERE term_id=?");
$stmt->bind_param("sssi", $term_code, $start_date, $end_date, $term_id);

if($stmt->execute()){
    echo json_encode(["status"=>"success"]);
} else {
    echo json_encode(["status"=>"error", "message"=>$stmt->error]);
}
?>

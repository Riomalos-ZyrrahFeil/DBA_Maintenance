<?php
include '../../db.php';

$term_id = $_POST['term_id'] ?? '';

$stmt = $conn->prepare("UPDATE tbl_term SET is_deleted=1 WHERE term_id=?");
$stmt->bind_param("i", $term_id);

if($stmt->execute()){
    echo json_encode(["status"=>"success"]);
} else {
    echo json_encode(["status"=>"error", "message"=>$stmt->error]);
}
?>

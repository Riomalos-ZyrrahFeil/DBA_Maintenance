<?php
include '../../db.php';

header('Content-Type: application/json');

if(!isset($_GET['id'])){
    echo json_encode(["status" => "error", "message" => "No ID provided"]);
    exit;
}

$section_id = $_GET['id'];

$stmt = $conn->prepare("DELETE FROM tbl_section WHERE section_id=?");
$stmt->bind_param("i", $section_id);

if($stmt->execute()){
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>

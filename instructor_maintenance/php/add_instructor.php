<?php
include '../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$last_name = $data['last_name'] ?? '';
$first_name = $data['first_name'] ?? '';
$email = $data['email'] ?? '';
$dept_id = $data['dept_id'] ?? '';

if($last_name && $first_name && $email && $dept_id){
    $stmt = $conn->prepare("INSERT INTO tbl_instructor (last_name, first_name, email, dept_id) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sssi", $last_name, $first_name, $email, $dept_id);
    if($stmt->execute()){
        echo json_encode(['status'=> 'success', 'message'=> 'Instructor added successfully']);
    }else{
        echo json_encode(['status'=> 'error', 'message'=> 'Failed to add instructor']);
    }
    $stmt->close();
}else{
    echo json_encode(['status'=> 'error', 'message'=> 'All fields are required']);
}
?>

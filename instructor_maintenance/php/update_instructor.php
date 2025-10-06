<?php
include '../../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$instructor_id = $data['instructor_id'] ?? '';
$last_name = $data['last_name'] ?? '';
$first_name = $data['first_name'] ?? '';
$email = $data['email'] ?? '';
$dept_id = $data['dept_id'] ?? '';

if($instructor_id && $last_name && $first_name && $email && $dept_id){
    $stmt = $conn->prepare("UPDATE tbl_instructor SET last_name=?, first_name=?, email=?, dept_id=? WHERE instructor_id=?");
    $stmt->bind_param("sssii", $last_name, $first_name, $email, $dept_id, $instructor_id);
    if($stmt->execute()){
        echo json_encode(['status'=> 'success', 'message'=> 'Instructor updated successfully']);
    }else{
        echo json_encode(['status'=> 'error', 'message'=> 'Failed to update instructor']);
    }
    $stmt->close();
}else{
    echo json_encode(['status'=> 'error', 'message'=> 'All fields are required']);
}
?>

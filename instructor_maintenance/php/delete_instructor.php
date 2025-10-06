<?php
include '../../db.php';

$instructor_id = $_POST['id'] ?? '';

if($instructor_id){
    $stmt = $conn->prepare("DELETE FROM tbl_instructor WHERE instructor_id=?");
    $stmt->bind_param("i", $instructor_id);
    if($stmt->execute()){
        echo json_encode(['status'=>'success','message'=>'Instructor deleted successfully']);
    }else{
        echo json_encode(['status'=>'error','message'=>'Failed to delete instructor']);
    }
    $stmt->close();
}else{
    echo json_encode(['status'=>'error','message'=>'Instructor ID is required']);
}
?>

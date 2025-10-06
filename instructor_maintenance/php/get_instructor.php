<?php
include '../../db.php';

if(isset($_GET['id'])){
    // Get single instructor for edit
    $id = $_GET['id'];
    $stmt = $conn->prepare("SELECT * FROM tbl_instructor WHERE instructor_id=?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
    $stmt->close();
}else{
    // Get all instructors for table
    $sql = "SELECT i.instructor_id, i.first_name, i.last_name, i.email, i.dept_id, d.dept_name 
            FROM tbl_instructor i 
            LEFT JOIN tbl_department d ON i.dept_id = d.dept_id 
            ORDER BY i.instructor_id DESC";
    $res = $conn->query($sql);
    $instructors = [];
    while($row = $res->fetch_assoc()){
        $instructors[] = $row;
    }
    echo json_encode($instructors);
}
?>

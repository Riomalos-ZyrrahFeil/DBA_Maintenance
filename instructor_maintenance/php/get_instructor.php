<?php
include '../../db.php';

if(isset($_GET['id'])){
    // Get single instructor for edit
    $id = $_GET['id'];
    $stmt = $conn->prepare("SELECT * FROM tbl_instructor WHERE instructor_id=? AND is_deleted=0");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
    $stmt->close();
} else {
    // Get all instructors with search and sort
    $search = $_GET['search'] ?? '';
    $sort_by = $_GET['sort_by'] ?? 'instructor_id';
    $order = $_GET['order'] ?? 'DESC';

    // Prevent SQL injection for column and order
    $allowed_columns = ['instructor_id','first_name','last_name','email','dept_name'];
    $sort_by = in_array($sort_by, $allowed_columns) ? $sort_by : 'instructor_id';
    $order = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';

    // Include is_deleted = 0 and search in department name too
    $sql = "SELECT i.instructor_id, i.first_name, i.last_name, i.email, i.dept_id, d.dept_name 
            FROM tbl_instructor i 
            LEFT JOIN tbl_department d ON i.dept_id = d.dept_id 
            WHERE i.is_deleted = 0 AND 
                  (i.first_name LIKE ? OR i.last_name LIKE ? OR i.email LIKE ? OR d.dept_name LIKE ?)
            ORDER BY $sort_by $order";

    $stmt = $conn->prepare($sql);
    $likeSearch = "%$search%";
    $stmt->bind_param("ssss", $likeSearch, $likeSearch, $likeSearch, $likeSearch);
    $stmt->execute();
    $res = $stmt->get_result();

    $instructors = [];
    while($row = $res->fetch_assoc()){
        $instructors[] = $row;
    }

    echo json_encode($instructors);
    $stmt->close();
}

$conn->close();
?>

<?php
// sidebar.php
$current_page = basename($_SERVER['PHP_PATH_INFO'] ?? $_SERVER['PHP_SELF']);
?>
<div class="sidebar">
    <div class="sidebar-header">
        <img src="https://www.pup.edu.ph/about/images/logo.png" alt="PUP Logo" class="sidebar-logo">
        <h3>PUP Maintenance</h3>
    </div>
    
    <nav class="sidebar-nav">
        <ul>
            <li class="<?php echo ($current_page == 'dashboard.php') ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/dashboard.php">Dashboard</a>
            </li>
            <li class="<?php echo ($current_page == 'index.php' && strpos($_SERVER['PHP_SELF'], 'course_maintenance') !== false) ? 'active' : ''; ?>">
                <a href="/dashboard/MaintenanceModule/course_maintenance/index.php">Course Maintenance</a>
            </li>
            <li><a href="/dashboard/MaintenanceModule/student_maintenance/index.php">Student Maintenance</a></li>
            <li><a href="/dashboard/MaintenanceModule/subject_maintenance/index.php">Subject Maintenance</a></li>
        </ul>
    </nav>

    <div class="sidebar-footer">
        <a href="php/logout.php" class="logout-link">Logout</a>
    </div>
</div>
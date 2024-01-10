$.ajax({
    url: '/general/getProfileDetails',
    type: 'GET',
    success: function(data) {
        header(data.FirstName + ' ' + data.LastName, data.ProfilePicture)
        // sideBar(data.AccessType)
        sideBar(data.Access, data.SubModuleAccess)
    },
    async: false
});

function sideBar(type, SubModuleAccess){
    $('.page-sidebar').html(
        `<div class="logo-box">
            <a href="/" class="logo-text">
                <img src="../../assets/images/One Click Insurance.png" class="img-fluid side-bar-logo" width="190">
            </a>
            <a href="#" id="sidebar-close">
                <i class="material-icons">close</i>
            </a>
            <a href="#" id="sidebar-state">
                <!--<i class="material-icons">menu_open</i>-->
                <i class="material-icons compact-sidebar-icon">menu</i>
            </a>
        </div>`
    )

    $('.page-sidebar').append(`
        <div class="page-sidebar-inner slimscroll">
            <ul class="accordion-menu modules">
                <li class="sidebar-title">
                    Access You have
                </li>
                <li id="dashboard">
                    <a href="/"><i class="material-icons-outlined">dashboard</i>Dashboard</a>
                </li>
            </ul>
        </div>
    `);
    
    const dataArray = Array.isArray(type) ? type : [type];
    dataArray.forEach(element => {
        if(element.HasSubModule){
            $('.modules').append(
                `<li class="sidebar-title">
                    ${element.SidebarTitle}
                </li>
                <li id="module-${element.ModuleID}">
                    <a href="#"><i class="material-icons">${element.ModuleIcon}</i>${element.ModuleTitle}<i class="material-icons has-sub-menu">add</i></a>
                    <ul class="sub-menu sub-modules-for-${element.ModuleID}"></ul>
                </li>`
            )
            var subModulesAccess = JSON.parse(SubModuleAccess)?.find(obj => obj.ModuleID === element.ModuleID);
            if(subModulesAccess){
                subModulesAccess.SubModuleID.split(',').forEach(element1 => {
                    var parts = JSON.parse(element.SubModuleURL).find(obj => obj.ID == element1)
                    $('.sub-modules-for-' + element.ModuleID).append(`
                        <li>
                            <a href="/${$.trim(element.SidebarTitle + '/' + parts.Title).replace(/[^\w\s\/-]/g, '').replace(/\s+/g, '-').toLowerCase()}" id="sub-module-for-${element.ModuleID + '-' + parts.ID}">${parts.Title}</a>
                        </li>
                    `)
                })
            }
        }
        else{
            $('.modules').append(
                `<li class="sidebar-title">
                    ${element.SidebarTitle}
                </li>
                <li id="${element.ModuleID}">
                    <a href="${element.ModuleURL}"><i class="material-icons">${element.ModuleIcon}</i>${element.ModuleTitle}</a>
                </li>`
            )
        }
    });

    if(type == 1){
        $('.page-sidebar').append(
            `<div class="page-sidebar-inner slimscroll">
                <ul class="accordion-menu">
                    <li class="sidebar-title">
                        Access You have
                    </li>
                    <li id="dashboard">
                        <a href="/"><i class="material-icons-outlined">dashboard</i>Dashboard</a>
                    </li>
                    <li class="sidebar-title">
                        Accounts
                    </li>
                    <li id="manageAccounts">
                        <a href="#"><i class="material-icons">insights</i>Manage Accounts<i class="material-icons has-sub-menu">add</i></a>
                        <ul class="sub-menu">
                            <li>
                                <a href="/administrator/collectFee" id="collectFee">Collect Fee</a>
                            </li>
                            <li>
                                <a href="/administrator/collectFee" id="feeCollectionRecord">Fee Collection Record</a>
                            </li>
                            <li>
                                <a href="/administrator/manageFee" id="manageFee">Manage Fee</a>
                            </li>
                            <li>
                                <a href="/administrator/managePay" id="managePay">Manage Pay</a>
                            </li>
                            <li>
                                <a href="/administrator/manageExpenses" id="manageExpenses">Manage Expenses</a>
                            </li>
                        </ul>
                    </li>
                    <li class="sidebar-title">
                        Students
                    </li>
                    <li id="manageStudents">
                        <a href="#"><i class="material-icons">assignment_ind</i>Manage Students<i class="material-icons has-sub-menu">add</i></a>
                        <ul class="sub-menu">
                            <li>
                                <a href="/administrator/browseStudent" id="browseStudents">Browse Students</a>
                            </li>
                            <li>
                                <a href="/administrator/enrollStudent" id="enrollStudents">Eroll Student</a>
                            </li>
                        </ul>
                    </li>
                    <li class="sidebar-title">
                        Staff
                    </li>
                    <li id="manageStaff">
                        <a href="#"><i class="material-icons">apps</i>Manage Staff<i class="material-icons has-sub-menu">add</i></a>
                        <ul class="sub-menu">
                            <li>
                                <a href="/administrator/browseStaff" id="browseStaffMembers">Browse Staff Members</a>
                            </li>
                            <li>
                                <a href="/administrator/appointStaffMember" id="appointStaffMember">Appoint New Member</a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="charts.html"><i class="material-icons">bar_chart</i>Course Management</a>
                    </li>
                    <li class="sidebar-title">
                        Attendance
                    </li>
                    <li id="studentAttendance">
                        <a href="/administrator/studentAttendance"><i class="material-icons">bar_chart</i>Students' Attendance</a>
                    </li>
                    <li id="staffAttendance">
                        <a href="/administrator/staffAttendance"><i class="material-icons">input</i>Staff's Attendance</a>
                    </li>
                    <li class="sidebar-title">
                        Software Management
                    </li>
                    <li id="softwareConfiguration">
                        <a href="/administrator/softwareConfiguration"><i class="material-icons">settings</i>eIMS Configuration</a>
                    </li>
                    <li class="sidebar-title">
                        Exam & Report
                    </li>
                    <li id="assesmentsExams">
                        <a href="#"><i class="material-icons">apps</i>Assesment & Exam<i class="material-icons has-sub-menu">add</i></a>
                        <ul class="sub-menu">
                            <li>
                                <a href="/administrator/onlineExam" id="commenceExam">Commence Exam</a>
                            </li>
                            <li>
                                <a href="ui-badge.html" id="progressReport">Progress Report</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>`
        )
    }
}

function header(user, profilePicture){
    $('.navbar').append(
        `<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <ul class="navbar-nav">
            <li class="nav-item small-screens-sidebar-link">
                <a href="#" class="nav-link"><i class="material-icons-outlined">menu</i></a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link"><i class="material-icons-outlined">notifications</i></a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link" id="dark-theme-toggle"><i class="material-icons-outlined">brightness_2</i><i class="material-icons">brightness_2</i></a>
            </li>
        </ul>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav accordion-menu" style="margin-top:0px !important; padding-bottom:0px !important;">
                <li class="nav-item">
                    <a href="javascript:void(0)" class="nav-link"><i class="material-icons">access_time_filled</i><span class="clock"></span></a>
                </li>
            </ul>
        </div>
        <ul class="navbar-nav">
            <li class="nav-item nav-profile dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <img src="../../assets/images/profilePictures/` + profilePicture + `" alt="profile image">
                    <span class="text-uppercase">` + user + `</span>
                    <i class="material-icons dropdown-icon">keyboard_arrow_down</i>
                </a>
                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                    <a class="dropdown-item" href="#">Notification<span class="badge badge-pill badge-info float-right">0</span></a>
                    <a class="dropdown-item" href="/general/profile">My Profile</a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item text-danger" href="/logout"><i class="material-icons" style="font-size:15px; font-weight:700;margin-top:2px; position: absolute;">logout</i>&emsp;&ensp;Log out</a>
                </div>
            </li>
        </ul>`
    )

    setInterval(function() {
        $('.clock').html(
            moment().format('MMMM, DD YYYY - hh:mm:ss A')
        );
    }, 500);
}
$('#module-5').addClass('active-page')
$('#sub-module-for-5-3').addClass('active')

$('#staffDataFilter').change(function(){
    getStaffMembers();
})

var modules = '', access = '';
$.ajax({
    url: '/eims-configuration/getAllModules',
    type: 'GET',
    success: function(data) {
        modules = data;
        modules.forEach(element => {
            $('#grantedModules').append(`<option value="${element.ModuleID}">${element.ModuleTitle}</option>`)
        });
        $('#grantedModules').select2({multiple: true})
        getStaffMembers();
    }
})

function setupModulesForDisplay(){
    var moduleTitles = modules.map(function(module) {
        var accessItem = access.find(function(accessModule) {
            return accessModule.ModuleID == module.ModuleID.toString();
        });
      
        if (accessItem) {
            var subModuleIDs = accessItem.SubModuleID.split(',');
            var subModuleURLs = JSON.parse(module.SubModuleURL);
        
            var titles = subModuleURLs.filter(function(subModule) {
                return subModuleIDs.includes(subModule.ID.toString());
            }).map(function(subModule) {
                return subModule.Title;
            });
      
          return {
                ModuleTitle: module.ModuleTitle,
                Titles: titles
          };
        }
        return null;
    });
    return moduleTitles;
}

function getStaffMembers(){
    $('#staffMembersDataCard').block();
    if (!$('#staffMembersDataTable').hasClass('dataTable') ) {
        $('#staffMembersDataTable').DataTable().destroy();
    }

    $.ajax({
        url: '/eims-configuration/getStaffAccessDetails',
        type: 'POST',
        data: {'filter': $('#staffDataFilter').val()},
        success: function(data) {
            $('#staffMembersDataCard').block({timeout: 0.1});
            var table = $('#staffMembersDataTable');
            if (table.hasClass('dataTable') ) {
                table.DataTable().destroy();
            }

            // data.forEach(element => {
            //     var modules = '';
            //     if(element.SubModuleAccess != 'null'){
            //         access = JSON.parse(element.SubModuleAccess)
            //         setupModulesForDisplay().forEach(element => {
            //             modules += '<div class="d-block">' +
            //                             '<span class="badge badge-info mb-1">' + element.ModuleTitle + '</span>' +
            //                         '</div>'
            //             element.Titles.forEach(element1 => {
            //                 modules += '<span class="badge badge-secondary mr-1 mb-3">' + element1 + '</span>'
            //             });
            //         });
            //     }
            //     else{
            //         modules = '<span class="text-muted">No access is given yet.</span>'
            //     }
            //     table.append(`
            //         <tr>
            //             <td>
            //                 ${element.StaffID}
            //             </td>
            //             <td>
            //                 ${element.Name}
            //                 <br>
            //                 <small>
            //                     ${element.Gender === 'Male' ? 'S/O' : 'D/O' + ' ' + element.FatherName}
            //                 </small>
            //             </td>
            //             <td>
            //                 ${element.ContactNumber}
            //                 <br>
            //                 <small>
            //                     ${element.UserEmail + '<br>' + element.ResidentialAddress}
            //                 </small>
            //             </td>
            //             <td>
            //                 ${modules}
            //             </td>
            //         </tr>
            //     `)
            // });

            // table.DataTable({
            //     scrollX: true,
            //     createdRow: function (row, data, dataIndex) {
            //         $(row).attr('data-toggle', 'tooltip')
            //         .attr('data-placement', 'left')
            //         .attr('title', 'Click to edit ' + data.Name + "'s data")
            //     }
            // });
            // $('[data-toggle="tooltip"]').tooltip();

            table.DataTable({
                scrollX: true,
                columns: [
                    { data: 'StaffID' },
                    {
                        data: 'Name',
                        render: function(data, type, full, meta) {
                            var prefix = 'D/O';
                            if (full.Gender === 'Male') {
                                prefix = 'S/O';
                            }
                            return data + '<br><small>' + prefix + ' ' + full.FatherName + '</small>';
                        }
                    },
                    { 
                        data: 'ContactNumber',
                        render: function(data, type, full, meta) {
                            return '+92 (' + data.toString().slice(0, 3) + ') ' + data.toString().slice(3, 6) + ' ' + data.toString().slice(6, 10) + '<br><small>' + full.UserEmail + '<br>' + full.ResidentialAddress + '</small>';
                        }
                    },
                    {
                        data: 'SubModuleAccess',
                        render: function(data, type, full, meta) {
                            var modules = '';
                            if (data != null && data != 'null') {
                                access = JSON.parse(data);
                                setupModulesForDisplay().forEach(element => {
                                    if(element != null){
                                        modules += '<div class="d-block">' +
                                            '<span class="badge badge-info mb-1">' + element.ModuleTitle + '</span>' +
                                        '</div>'
                                        element.Titles.forEach(element1 => {
                                            modules += '<span class="badge badge-secondary mr-1 mb-3">' + element1 + '</span>'
                                        });
                                    }
                                });
                            }
                            else {
                                modules = '<span class="text-muted">No access is given yet.</span>';
                            }
                            return modules;
                        }
                    },
                ],
                createdRow: function (row, data, dataIndex) {
                    $(row).attr('data-toggle', 'tooltip')
                        .attr('data-placement', 'left')
                        .attr('title', 'Click to modify ' + data.Name + "'s access");
                }
            });
            table.DataTable().clear().rows.add(data).draw();
            $('[data-toggle="tooltip"]').tooltip();
            

            // table.DataTable({
            //     scrollX: true,
            //     columns: [
            //         { data: 'StaffID' },
            //         {
            //             data: 'Name',
            //             render: function(data, type, full, meta) {
            //                 var prefix = 'D/O'
            //                 if(full.Gender == 'Male'){
            //                     prefix = 'S/O'
            //                 }
            //                 return data + '<br><small>' + prefix + ' ' + full.FatherName + '</small>';
            //             }
            //         },
            //         { 
            //             data: 'ContactNumber',
            //             render: function(data, type, full, meta) {
            //                 return '+92 (' + data.toString().slice(0, 3) + ') ' + data.toString().slice(3, 6) + ' ' + data.toString().slice(6, 10) + '<br><small>' + full.UserEmail + '<br>' + full.ResidentialAddress + '</small>';
            //             }
            //         },
            //         {
            //             data: 'AppointmentDate',
            //             render: function(data, type, full, meta) {
            //                 if (type === 'display') {
            //                     return moment(data).format('dddd, MMM DD, YYYY')
            //                 }
            //                 else {
            //                     return data;
            //                 }
            //             }
            //         },
            //         { data: 'Designation' },
            //     ],
            //     createdRow: function (row, data, dataIndex) {
            //         $(row).attr('data-toggle', 'tooltip')
            //             .attr('data-placement', 'left')
            //             .attr('title', 'Click to edit ' + data.Name + "'s data")
            //     }
            // });
            // table.DataTable().clear().rows.add(data).draw();
            // $('[data-toggle="tooltip"]').tooltip();
        }
    });
}

var empID = ''
$('#staffMembersDataTable tbody').on('click', 'tr', function () {
    var table = $('#staffMembersDataTable').DataTable();
    var data = table.row(this).data();
    empID = data.StaffID;
    $('#staffAccessDetailsTitle').text(data.Name)
    $('#staffMembersDataTable').block();
    $.ajax({
        url: '/eims-configuration/getAccessbyStaffID',
        type: 'POST',
        data: {'staffID': data.StaffID},
        success: function(data) {
            $('#grantedModules').val(data[0].ModuleAccess.split(',').map(Number)).trigger('change')
            if(data[0].ModuleAccess != ""){
                JSON.parse(data[0].SubModuleAccess).forEach(element => {
                    $('#dropdown-' + element.ModuleID).val(element.SubModuleID.split(',').map(Number)).trigger('change')
                });
            }
            $('#staffMembersDataTable').block({timeout: 0.1});
            $('.staffAccessDetailsPopup').modal('show');
        }
    });
});

$('#grantedModules').change(function(){
    $('#dropdownContainer').empty();
    $('#grantedModules').val().forEach(element => {
        var submodules = modules.filter(function(item) {
            return item.ModuleID == element;
        })[0];

        var label = $('<label>')
            .text('Sub-module(s) for ' + submodules.ModuleTitle)
            .attr('for', 'dropdown-' + element);
        
        var dropdown = $('<select>').addClass('form-control mb-4').css('width', '100%').attr('name', 'dropdown-' + element).attr('id', 'dropdown-' + element).attr('multiple', 'multiple').attr('required', 'required');
        JSON.parse(submodules.SubModuleURL).forEach(element1 => {
            var optionElement = $('<option>', {
                value: element1.ID,
                text: element1.Title,
            });
            dropdown.append(optionElement);
        });
        $('#dropdownContainer').append(label);
        $('#dropdownContainer').append(dropdown);
        $('#dropdownContainer').append(`
            <div class="invalid-feedback">
                Please select atleast one sub-module.
            </div>
        `);
        $('#dropdownContainer').append('<br><br>');
        $('#dropdown-' + element).select2({multiple: true});
    });
})

$('#accessForm').submit(function(e){
    if(document.getElementById('accessForm').checkValidity() !== false){
        e.preventDefault()
        $('#accessForm').block();

        var oldJSON = $('#accessForm').serializeArray()
        var newJSON = oldJSON
        .filter(item => item.name === 'grantedModules')
        .map(item => {
            var moduleID = item.value;
            return {
                ModuleID: parseInt(moduleID),
                SubModuleID: oldJSON
                    .filter(subItem => subItem.name === 'dropdown-' + moduleID)
                    .map(subItem => subItem.value)
                    .join(',')
            };
        });

        var moduleIDs = newJSON.map(function(item) {
            return item.ModuleID;
        });
        var moduleIDString = moduleIDs.join(',');

        $.ajax({
            url: '/eims-configuration/updateProfileAccess',
            type: 'POST',
            // data: $('#accessForm').serialize(),
            data: {'modules': moduleIDString, 'values': JSON.stringify(newJSON), 'StaffID': empID},
            success: function(data) {
                if(data == 'Success'){
                    triggerAlert('Successfully updated data.', 'success');
                    // getStaffMembers()
                    $('.staffAccessDetailsPopup').modal('hide');
                    location.reload();
                }
                else{
                    triggerAlert(data, 'error');
                }
                $('#accessForm').block({timeout: 0.1});
            }
        });
    }
})

$('select').select2();
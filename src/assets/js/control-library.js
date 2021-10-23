
$(document).ready(function () {
    $('.custom-file-input').on('change', function () {
        let fileName = $(this).val().split('\\').pop();  //get the file name
        $(this).next('.custom-file-label').addClass("selected").html(fileName);  //replace the "Choose a file" label
    });

    //  $('[data-toggle="tooltip"]').tooltip();  //tooltip

     //popover
    //  $('.popover-dismiss').popover({
    //        trigger: 'focus'
    //     });  
    //     $('.example-popover').popover({
    //             container: 'body',
    //             html: true, 
    //             content: function() {
    //             return $('#popover-content').html();
    //         }
    //      });  
     //popover
    //  $('[data-toggle="popover"]').popover(
       
    //  );

    // $('.carousel').carousel({
    //     interval: 3000, cycle: true 
    // });
    

});
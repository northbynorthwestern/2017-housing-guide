
$('.chosen-select').chosen();
$('#searchbox').change(function() {
    window.location.href = $(this).val();
});
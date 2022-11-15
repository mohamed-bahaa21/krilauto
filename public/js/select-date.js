const input = $('input[name="dates"]')

input.daterangepicker({
    applyButtonClasses: 'd-none',
    showDropdowns: false,
    opens: "center",
    drops: "down",
    autoApply: false,
    startDate: input.data('start'),
    endDate: input.data('end'),
    minDate: input.data('11/01/2022'),
    maxDate: input.data('01/01/2023'),
    locale: {
        format: "MM/DD/YYYY",
        separator: " - ",
        applyLabel: "Apply",
        cancelLabel: "Canel",
        fromLabel: "From",
        toLabel: "To",
        customRangeLabel: "Custom",
        weekLabel: "S",
        daysOfWeek: [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
        ],
        monthNames: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ],
        firstDay: 1
    }
});
const input = $('input[name="dates"]')

input.daterangepicker({
    applyButtonClasses: 'd-none',
    showDropdowns: false,
    opens: "center",
    drops: "down",
    autoApply: false,
    startDate: input.data('start'),
    endDate: input.data('end'),
    minDate: input.data('start'),
    maxDate: input.data('end'),
    locale: {
        format: "DD/MM/YYYY",
        separator: " - ",
        applyLabel: "Aplicar",
        cancelLabel: "Fechar",
        fromLabel: "De",
        toLabel: "Até",
        customRangeLabel: "Custom",
        weekLabel: "S",
        daysOfWeek: [
            "Dom",
            "Seg",
            "Ter",
            "Qua",
            "Qui",
            "Sex",
            "Sab"
        ],
        monthNames: [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro"
        ],
        firstDay: 1
    }
});
function EolZoomStudioXBlock(runtime, element, settings) {
    var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
  
    $(element).find('.save-button').bind('click', function(e) {
        /*
        * Get form data and create meeting at Zoom app.
        * Update values in XBlock
        */
        var form_data = new FormData();
        var display_name = $(element).find('input[name=display_name]').val();
        var description = $(element).find('input[name=description]').val();
        var date = $(element).find('input[name=date]').val();
        var time = $(element).find('input[name=time]').val();
        var duration = $(element).find('input[name=duration]').val();
        if(display_name == "" || description == "" || date == "" || time == "" || duration < 0 || duration == "") {
            alert("Datos inválidos. Revisa nuevamente la información ingresada");
            e.preventDefault();
            return;
        }
        form_data.append('display_name', display_name);
        form_data.append('description', description);
        form_data.append('date', date);
        form_data.append('time', time);
        form_data.append('duration', duration);
        form_data.append('meeting_id', settings.meeting_id);

        /*
        * Set update meeting url if already have a meeting_id
        */
        if(settings.meeting_id) {
            url_meeting = settings.url_update_meeting;
        } else {
            url_meeting = settings.url_new_meeting;
        }
        /*
        * Create or Update meeting
        */
        $.ajax({
            url: url_meeting,
            dataType: 'text',
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            type: "POST",
            success: function(response){
                /*
                * Update XBlock
                */
                data = JSON.parse(response)
                form_data.set('meeting_id', data.meeting_id) // update value
                if ($.isFunction(runtime.notify)) {
                    runtime.notify('save', {state: 'start'});
                }
                $.ajax({
                    url: handlerUrl,
                    dataType: 'text',
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: form_data,
                    type: "POST",
                    success: function(response){
                    if ($.isFunction(runtime.notify)) {
                        runtime.notify('save', {state: 'end'});
                    }
                    }
                });
            }
        });

        e.preventDefault();
  
    });

    $(element).find('.cancel-button').bind('click', function(e) {
      runtime.notify('cancel', {});
      e.preventDefault();
    });

    $(function($) {
        // Hide sve button and form when user not logged
        $('.eolzoom_studio li.field').hide();
        $('.save-button').hide();

        check_is_logged();
        get_login_url();

        function check_is_logged() {
            /*
            * Check if user is logged at Eol Zoom API
            */
            url = settings.url_is_logged_zoom;
            $.get(url, function(data, status){
                if(data.is_logged) {
                    // Show submit button and form whem user is succefully logged
                    $('.eolzoom_studio li').show();
                    $('.save-button').show();
                    $('.logging-container .zoom-login-btn').hide();
                    $('.logging-container .zoom-hint').addClass('zoom-hint-success').html("<span>Cuentas con una sesión de Zoom correctamente iniciada<br>Si presentas problemas, presiona <a href='" + get_login_url() +  "' >este enlace.</a></span>");
                }
            });
        }

        function get_login_url() {
            /*
            * Generate login url
            */
            actual_url = encodeURIComponent(window.location.href);
            redirect_uri = encodeURIComponent(window.location.protocol + "//" + window.location.hostname + settings.url_login)+ "?redirect=" + actual_url;
            login_url = settings.url_zoom_api + redirect_uri ;
            $('.logging-container .zoom-login-btn').attr('href', login_url);
            return login_url;
        }

    });
  
  }
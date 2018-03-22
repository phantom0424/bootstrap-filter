// 重写bootstrap-select liveSearchListener
;(function ($, window, document, undefined) {
    function htmlEscape(html) {
        var escapeMap = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '`': '&#x60;'
        };
        var source = '(?:' + Object.keys(escapeMap).join('|') + ')',
            testRegexp = new RegExp(source),
            replaceRegexp = new RegExp(source, 'g'),
            string = html == null ? '' : '' + html;
        return testRegexp.test(string) ? string.replace(replaceRegexp, function (match) {
          return escapeMap[match];
        }) : string;
    }
    
    var timeOut = '';
    
    $.extend($.fn.selectpicker.Constructor.prototype, {
        liveSearchListener: function(){
            var that = this,
            $no_results = $('<li class="no-results"></li>');

            this.$button.on('click.dropdown.data-api touchstart.dropdown.data-api', function () {
              that.$menuInner.find('.active').removeClass('active');
              if (!!that.$searchbox.val()) {
    //            that.$searchbox.val('');
                that.$lis.not('.is-hidden').removeClass('hidden');
                if (!!$no_results.parent().length) $no_results.remove();
              }
              if (!that.multiple) that.$menuInner.find('.selected').addClass('active');
              setTimeout(function () {
                that.$searchbox.focus();
              }, 10);
            });
    
            this.$searchbox.on('click.dropdown.data-api focus.dropdown.data-api touchend.dropdown.data-api', function (e) {
              e.stopPropagation();
            });
    
            this.$searchbox.on('input propertychange', function () {
                // 远程搜索
                if(that.options.remoteSearch){
                    that.$searchOldValue = that.$searchOldValue || '';
                    clearTimeout(timeOut);
                    if(that.$searchOldValue !== that.$searchbox.val()){
                        setTimeout(function(){
                            that.$searchOldValue = that.$searchbox.val();
                            timeOut = setTimeout(function(){   //设置延后ajax请求
                                that.$element.bsfilter('search', that.$searchbox.val(), originalPropertyChange);
                                clearTimeout(timeOut);
                            }, 400)
                        }, 100);
                    }
                }else{
                    originalPropertyChange();
                }
                
                function originalPropertyChange(){
                    if (that.$searchbox.val()) {
                        that.findLis();
                        var $searchBase = that.$lis.not('.is-hidden').removeClass('hidden').children('a');
                        if (that.options.liveSearchNormalize) {
                            $searchBase = $searchBase.not(':a' + that._searchStyle() + '("' + normalizeToBase(that.$searchbox.val()) + '")');
                        } else {
                            $searchBase = $searchBase.not(':' + that._searchStyle() + '("' + that.$searchbox.val() + '")');
                        }
                        $searchBase.parent().addClass('hidden');
                        
                        that.$lis.filter('.dropdown-header').each(function () {
                            var $this = $(this),
                            optgroup = $this.data('optgroup');
                            
                            if (that.$lis.filter('[data-optgroup=' + optgroup + ']').not($this).not('.hidden').length === 0) {
                                $this.addClass('hidden');
                                that.$lis.filter('[data-optgroup=' + optgroup + 'div]').addClass('hidden');
                            }
                        });
                        
                        var $lisVisible = that.$lis.not('.hidden');
                        
                        // hide divider if first or last visible, or if followed by another divider
                        $lisVisible.each(function (index) {
                            var $this = $(this);
                            
                            if ($this.hasClass('divider') && (
                                    $this.index() === $lisVisible.first().index() ||
                                    $this.index() === $lisVisible.last().index() ||
                                    $lisVisible.eq(index + 1).hasClass('divider'))) {
                                $this.addClass('hidden');
                            }
                        });
                        
                        if (!that.$lis.not('.hidden, .no-results').length) {
                            if (!!$no_results.parent().length) {
                                $no_results.remove();
                            }
                            $no_results.html(that.options.noneResultsText.replace('{0}', '"' + htmlEscape(that.$searchbox.val()) + '"')).show();
                            that.$menuInner.append($no_results);
                        } else if (!!$no_results.parent().length) {
                            $no_results.remove();
                        }
                    } else {
                        that.$lis.not('.is-hidden').removeClass('hidden');
                        if (!!$no_results.parent().length) {
                            $no_results.remove();
                        }
                    }
                    
                    that.$lis.filter('.active').removeClass('active');
                    if (that.$searchbox.val()) that.$lis.not('.hidden, .divider, .dropdown-header').eq(0).addClass('active').children('a').focus();
                    that.$searchbox.focus();
                }
            });
        }
    });
})(jQuery, window, document);

/*!
 * 语言包
 */
!function(a,b){b(jQuery)}(this,function(a){!function(a){a.fn.selectpicker.defaults={noneSelectedText:"没有选中任何项",noneResultsText:"没有找到匹配项",countSelectedText:"选中{1}中的{0}项",maxOptionsText:["超出限制 (最多选择{n}项)","组选择超出限制(最多选择{n}组)"],multipleSeparator:", "}}(a)});

/**
 * bootstrap-filter
 * TODO：
 * 1. 分组支持ok
 * 2. 事件支持ok
 * 3. 多选支持ok
 * 4. 预设值支持ok
 */
;(function ($, window, document, undefined) {
    'use strict';
    
    /**
     * 对象比较函数
     */
    var compareObjects = function (objectA, objectB, compareLength) {
        var objectAProperties = Object.getOwnPropertyNames(objectA),
            objectBProperties = Object.getOwnPropertyNames(objectB),
            propName = '';
        
        if (compareLength) {
            if (objectAProperties.length !== objectBProperties.length) {
                return false;
            }
        }
        
        for (var i = 0; i < objectAProperties.length; i++) {
            propName = objectAProperties[i];
            
            if ($.inArray(propName, objectBProperties) > -1) {
                if (objectA[propName] !== objectB[propName]) {
                    return false;
                }
            }
        }
        
        return true;
    };
    
    var pluginName = 'bsfilter',
        defaults = {};
    
    /**
     * Filter 类定义
     */
    var Filter = function (element, options) {
        this.element = element;
        this.$el = $(element);
        this.$el_ = this.$el.clone();
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    };
    
    // 版本号
    Filter.VERSION = '1.0.0';
    
    // 默认配置
    Filter.DEFAULTS = {
        classes: pluginName,
        data: [],
        notEmpty: false,
        url: '',
        queryParams: {},
        extraParams: undefined,
        inited: false,
        value: '',
        valueField: '',
        textField: '',
        groupField: '',
        searchField: '',
        emptyValue: '',
        emptyText: '请选择',
        textFormatter: function(text, item){
            return text;
        },
        groupFormatter: function(group, item){
            return group;
        },
        onAll: function (name, args) {
            return false;
        },
        onRefresh: function () {
            return false;
        },
        onRefreshOptions: function (options) {
            return false;
        },
        onDestroy: function(){
            return false;
        },
        onLoadSuccess: function(data, textStatus, e){
            return false;
        },
        onRendered: function(){
            return false;
        },
        onChange: function(){
            return false;
        },
        onInited: function(){
            return false;
        }
    };
    
    // 事件
    Filter.EVENTS = {};
    Filter.EVENTS['all.bs.' + pluginName] = 'onAll';
    Filter.EVENTS['refresh.bs.' + pluginName] = 'onRefresh';
    Filter.EVENTS['refresh-options.bs.' + pluginName] = 'onRefreshOptions';
    Filter.EVENTS['destroy.bs.' + pluginName] = 'onDestroy';
    Filter.EVENTS['load-success.bs.' + pluginName] = 'onLoadSuccess';
    Filter.EVENTS['rendered.bs.' + pluginName] = 'onRendered';
    Filter.EVENTS['inited.bs.' + pluginName] = 'onInited';
    
    Filter.prototype = {
        /**
         * 构造函数
         */
        constructor: Filter,
        
        /**
         * 初始化函数
         */
        init: function(){
            this.initOptions();
            this.bindEvent();
            // 临时做法
            if(!this.options.url && !$.isEmptyObject(this.options.data)){
                this.load(this.options.data, {});
            }else{
                this.loadData(this.options.extraParams && {extraParams: this.options.extraParams});
            }
        },
        
        /**
         * 初始化配置信息
         */
        initOptions: function(){
            var me = this,
                options = me.options;
            options.valueField || (options.valueField = options.textField);
            options.textField || (options.textField = options.valueField);
            
            if(!options.textField && !options.valueField){
                console && console.error('请提供有效的参数textField或valueField');
            }
            me.options.searchField = me.options.searchField || me.options.textField;
            options.remoteSearch = !!this.options.url;
            me.initQueryParams();
        },
        
        initQueryParams: function(queryParams){
            // 字段参数处理
            var options = this.options,
                queryParams = $.extend({}, queryParams || options.queryParams || {}),
                defaultFields = $.grep([options.valueField, options.textField, options.groupField], function(n, i){
                    return !!n;
                }),
                fields;
            
            if(queryParams.fields){
                fields = _.uniq(defaultFields.concat(queryParams.fields.split(','))).join(',');
            }else{
                fields = defaultFields.join(',');
            }
            queryParams['fields'] = fields;
            
            this.options.queryParams = queryParams;
            return $.extend(true, {}, queryParams);
        },
        
        load: function(data, opts){
            var me = this;
            if(!$.isArray(data)){
                var arr = [];
                $.isEmptyObject(data) || arr.push(data);
                data = arr;
            }
            opts.append ? me.appendView(data) : me.createView(data);
            if(me.options.notEmpty && !opts.append && me.values.length){
                me.$el.trigger('change');
            }
        },
        
        /**
         * 加载数据
         */
        loadData: function(opts){
            var me = this,
                options = me.options,
                opts = opts || {};
            this.xhr && this.xhr.abort();
            if(!options.url){
                return;
            }
            var queryParams = me.initQueryParams(opts.queryParams);
            opts.extraParams && (queryParams = $.extend({}, queryParams, opts.extraParams));
            this.xhr = $.ajax({
                type: 'get',
                url: options.url,
                data: queryParams,
                success: function(data, textStatus, jqXHR){
                    if(data.code == 0){
                        me.trigger('load-success', data, textStatus, jqXHR);
                        var rows = data.rows ? data.rows : data.data;
                        me.load(rows, opts);
                    }else{
                        console && console.error(data.message);
                    }
                    typeof opts.callback == 'function' && opts.callback.apply(me);
                },
                error: function(request, status, et){
                    console.log(request);
                }
            });
        },
        
        /**
         * 重新加载
         */
        reload: function(options){
            if(!options || !options.extraParams || !options.extraParams[this.options.searchField]){
                this.clearSearchText();
            }
            this.loadData(options);
        },
        
        /**
         * 搜索
         */
        search: function(value, callback){
            var extraParams = {};
            extraParams[this.options.searchField] = value;
            var opts = {
                    extraParams: extraParams,
                    callback: callback
                };
            if(this.$el.prop('multiple')){
                opts.append = true;
            }
            this.reload(opts);
        },
        
        /**
         * 设置下拉框的值，包括对多选的情况进行处理
         */
        setValue: function(value){
            var me = this,
                oldValue = me.$el.selectpicker('val');
            value = [].concat(value);
            var notExists = [],
                callback = function(){
                    me.$el.selectpicker('val', value);
                    me.$el.trigger('change');
                };
            $.each(value, function(index, item){
                item = (item == null || item == undefined) ? '': item.toString();
                if($.inArray(item, me.values) < 0){
                    notExists.push(item);
                }
            });
            if(notExists.length > 0){
                var opts = {
                    callback: callback,
                    extraParams: {},
                    append: true
                };
                opts.extraParams[me.options.valueField] = notExists.join(',');
                me.loadData(opts);
            }else{
                callback();
            }
            return me.$el;
        },
        
        /**
         * 获取选择项的文字
         */
        getText: function(){
            return this.$el.val() ? this.$el.find('option[value=' + this.$el.val() + ']').text() : '';
        },
        
        /**
         * 选择第一个有值的选项
         */
        selectFirst: function(){
            var me = this;
            $.each(me.values, function(index, item){
                if(item){
                    me.setValue(item);
                    return false;
                }
            });
            return me.$el;
        },
        
        /**
         * 清空视图
         */
        clearView: function(){
            this.$el.empty();
            this.values = [];
            this.$groups = {};
        },
        
        clearSearchText: function(){
            if(this.options.liveSearch){
                var $selectpicker = this.$el.data('selectpicker'),
                    $searchBox = $selectpicker && $selectpicker.$searchbox;
                $searchBox && $searchBox.val('');
            }
        },
        
        /**
         * 创建视图
         */
        createView: function(data){
            var me = this,
                options = me.options;
            me.clearView();
            if(!options.notEmpty && !me.$el.prop('multiple')){
                me.$el.append(me.createOption(options.emptyText, options.emptyValue));
                me.values.push(options.emptyValue);
            }
            me.appendView(data);
        },
        
        /**
         * 追加视图
         */
        appendView: function(data){
            var me = this,
                options = me.options,
                groupField = options.groupField;
            $.each(data, function(index, item){
                if($.inArray(item[options.valueField], me.values) > -1){
                    return;
                }
                if(groupField){
                    if(!me.$groups[item[groupField]]){
                        me.$groups[item[groupField]] = $('<optgroup>').prop('label', me.options.groupFormatter.apply(me.options, [item[groupField], item])).appendTo(me.$el);
                    }
                    me.$groups[item[groupField]].append(me.createOption(item[options.textField], item[options.valueField], item));
                }else{
                    me.$el.append(me.createOption(item[options.textField], item[options.valueField], item));
                }
                me.values.push(item[options.valueField]);
            });
            if(!options.inited && me.hasSelectpicker()) {
                me.$el.selectpicker('destroy');
            }
            me.$el.selectpicker(options.inited ? 'refresh' : options);
            if(options.value){
                me.setValue(options.value);
            }
            if(!options.inited){
                options.inited = true;
                me.originOptions = $.extend(true, {}, me.options);
                me.trigger('inited');
            }
            me.trigger('rendered');
        },
        
        /**
         * 创建下拉选择项
         */
        createOption: function(text, value, item){
            return $('<option>').val(value).text(this.options.textFormatter.apply(this.options, [text, item])).data('info', item);
        },
        
        /**
         * 绑定事件
         */
        bindEvent: function(){
            var me = this;
            me.$el.on('change', function(){
                me.options.onChange.apply(this, arguments);
            });
        },
        
        /**
         * 获取配置信息
         */
        getOptions: function () {
            return this.options;
        },
        
        /**
         * 获取数据
         */
        getData: function() {
            return this.data ? this.data : this.options.data;
        },
        
        /**
         * 刷新
         */
        refresh: function () {
            this.refreshOptions();
            if(this.options.liveSearch){
                this.search(this.$el.parent().find('.bs-searchbox input').val());
            }else{
                this.reload();
            }
            this.trigger('refresh', this.options);
        },
        
        /**
         * 刷新配置项
         */
        refreshOptions: function (options) {
            options = options || {};
            if (compareObjects(this.options, options, false)) {
                return;
            }
            this.options = $.extend(this.options, options);
            this.trigger('refresh-options', this.options);
            this.destroy();
            this.init();
        },
        
        /**
         * 恢复到初始后的状态
         */
        restore: function(){
            this.options = $.extend(true, {}, this.originOptions);
            this.reload();
        },
        
        /**
         * 是selectpicker
         */
        hasSelectpicker: function() {
            return !!this.$el.data('selectpicker');
        },
        
        /**
         * 摧毁控件
         */
        destroy: function () {
            this.$el.insertBefore(this.$container);
            this.$container.next().remove();
            this.$container.remove();
            this.$el.html(this.$el_.html())
            .css('margin-top', '0')
            .attr('class', this.$el_.attr('class') || ''); // reset the class
            this.trigger('destroy');
            this.$el.removeData('bootstrap.table');
        },
        
        /**
         * 触发事件
         */
        trigger: function (name) {
            var args = Array.prototype.slice.call(arguments, 1);
            
            name += '.bs.' + pluginName;
            this.options[Filter.EVENTS[name]].apply(this.options, args);
            this.$el.trigger($.Event(name), args);
            
            this.options.onAll(name, args);
            this.$el.trigger($.Event('all.bs.table'), [name, args]);
        }
    };

    // Filter PLUGIN DEFINITION
    // =======================
    var allowedMethods = [
        'getOptions',
        'getData',
        'destroy',
        'refresh',
        'refreshOptions',
        'restore',
        'reload',
        'search',
        'setValue',
        'getText',
        'selectFirst'
    ];
    
    /**
     * 插件定义
     */
    function Plugin(option, event){
        var args = arguments,
            _option = option,
            _event = event,
            result;
        [].shift.apply(args);
        var chain = this.each(function(){
            var $this = $(this),
                data = $.data(this, 'plugin_' + pluginName),
                options = typeof option === 'object' && _option;
            if(!$this.is('select')){
                return;
            }
            if(!data){
                var config = $.extend(true, {}, Filter.DEFAULTS, $.fn[pluginName].defaults || {}, $this.data(), options);
                $this.data('plugin_' + pluginName, (data = new Filter(this, config, _event)));
            }else if(options){
                for (var i in options) {
                    if (options.hasOwnProperty(i)) {
                        data.options[i] = options[i];
                    }
                }
            }
            
            if (typeof _option == 'string') {
                if (data[_option] instanceof Function) {
                    if ($.inArray(_option, allowedMethods) < 0) {
                        throw new Error("未知方法: " + option);
                    }else {
                        result = data[_option].apply(data, args);
                    }
                } else {
                    result = data.options[_option];
                }
            }
        });
        
        return typeof result === 'undefined' ? chain : result;
    }
    
    $.fn[pluginName] = Plugin;

    $.fn[pluginName].defaults = Filter.DEFAULTS;
    $.fn[pluginName].locales = Filter.LOCALES;
    $.fn[pluginName].methods = allowedMethods;
    $.fn[pluginName].utils = {
        compareObjects: compareObjects
    };

    // Filter初始化
    $(function () {
        $('[data-toggle="' + pluginName + '"]')[pluginName]();
    });

})(jQuery, window, document);
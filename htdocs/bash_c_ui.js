// This file is part of "bash -c <...> # Web Shell"
// (see <https://github.com/2011-02-21-bash-c-web-shell/bash-c-web-shell>).
//
// "bash -c <...> # Web Shell" is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// "bash -c <...> # Web Shell" is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with "bash -c <...> # Web Shell".  If not, see <http://www.gnu.org/licenses/>.

(function() {
    'use strict'
    
    var html_ns = 'http://www.w3.org/1999/xhtml'
    
    function debug_log(value) {
        var pre = document.getElementById('debug_log')
        
        if(pre) {
            pre.appendChild(
                document.createElementNS(html_ns, 'hr')
            )
            pre.appendChild(
                document.createTextNode('⚠ Debug Log: ' + value)
            )
            pre.appendChild(
                document.createElementNS(html_ns, 'html:br')
            )
            pre.style.display = 'block'
        }
    }
    
    var func_tools = {
        args_array: function(raw_args) {
            var args = []
        
            for(var i = 0; i < raw_args.length; ++i) {
                args.push(raw_args[i])
            }
            
            return args
        },
        func_bind: function(func, this_arg) {
            var args = this.args_array(arguments).slice(2)
            
            if(func.bind) {
                // using built 'func.bind()'. this is more effective way
                
                var bound = func.bind.apply(func, [this_arg].concat(args))
                
                return bound
            } else {
                // using emulation  of 'func.bind()'. this is less effective way
                
                var self_module = this
                
                var bound = function() {
                    var func_args = args.concat(self_module.args_array(arguments))
                    var func_res = func.apply(this_arg, func_args)
                    
                    return func_res
                }
                
                return bound
            }
        },
        list_iterate: function(l, iter) {
            for(var i = 0; i < l.length; ++i) {
                var v = l[i];
                
                iter(i, v)
            }
        },
        node_iterate: function(n, iter) {
            for(var in_n = n.firstChild;
                    in_n;
                    in_n = in_n.nextSibling) {
                iter(in_n)
            }
        },
    }
    
    function head_params_iterate(params_name, params_ns, iter) {
        func_tools.node_iterate(document, function(in_root_node) {
            if(in_root_node.nodeType == Node.ELEMENT_NODE &&
                    in_root_node.localName == 'html' &&
                    in_root_node.namespaceURI == html_ns) {
                func_tools.node_iterate(in_root_node, function(in_html_node) {
                    if(in_html_node.nodeType == Node.ELEMENT_NODE &&
                            in_html_node.localName == 'head' &&
                            in_html_node.namespaceURI == html_ns) {
                        func_tools.node_iterate(in_html_node, function(in_head_node) {
                            if(in_head_node.nodeType == Node.ELEMENT_NODE &&
                                    in_head_node.localName == params_name &&
                                    in_head_node.namespaceURI == params_ns) {
                                iter(in_head_node)
                            }
                        })
                    }
                })
            }
        })
    }
    
    function create_h_box(left_elems, center_elem, right_elems) {
        var h_box = document.createElementNS(html_ns, 'div')
        
        h_box.style.display = 'table'
        h_box.style.width = '100%'
        h_box.style.height = '100%'
        
        var row = document.createElementNS(html_ns, 'div')
        
        row.style.display = 'table-row'
        
        func_tools.list_iterate(left_elems, function(i, elem) {
            var cell = document.createElementNS(html_ns, 'div')
            
            cell.style.display = 'table-cell'
            cell.appendChild(elem)
            row.appendChild(cell)
            h_box.appendChild(row)
        })
        
        var cell = document.createElementNS(html_ns, 'div')
        
        cell.style.display = 'table-cell'
        cell.style.width = '100%'
        cell.appendChild(center_elem)
        row.appendChild(cell)
        h_box.appendChild(row)
        
        func_tools.list_iterate(right_elems, function(i, elem) {
            var cell = document.createElementNS(html_ns, 'div')
            
            cell.style.display = 'table-cell'
            cell.appendChild(elem)
            row.appendChild(cell)
            h_box.appendChild(row)
        })
        
        return h_box
    }
    
    function create_v_box(top_elems, center_elem, bottom_elems) {
        var v_box = document.createElementNS(html_ns, 'div')
        
        v_box.style.display = 'table'
        v_box.style.width = '100%'
        v_box.style.height = '100%'
        
        func_tools.list_iterate(top_elems, function(i, elem) {
            var row = document.createElementNS(html_ns, 'div')
            
            row.style.display = 'table-row'
            
            var cell = document.createElementNS(html_ns, 'div')
            
            cell.style.display = 'table-cell'
            cell.appendChild(elem)
            row.appendChild(cell)
            v_box.appendChild(row)
        })
        
        var row = document.createElementNS(html_ns, 'div')
        
        row.style.display = 'table-row'
        
        var cell = document.createElementNS(html_ns, 'div')
        
        cell.style.display = 'table-cell'
        cell.style.height = '100%'
        cell.appendChild(center_elem)
        row.appendChild(cell)
        v_box.appendChild(row)
        
        func_tools.list_iterate(bottom_elems, function(i, elem) {
            var row = document.createElementNS(html_ns, 'div')
            
            row.style.display = 'table-row'
            
            var cell = document.createElementNS(html_ns, 'div')
            
            cell.style.display = 'table-cell'
            cell.appendChild(elem)
            row.appendChild(cell)
            v_box.appendChild(row)
        })
        
        return v_box
    }
    
    function BashCUi() {
        this._history = []
    }
    
    BashCUi.prototype._create_root_node = function() {
        // TEST:
        var root_node = create_v_box(
            [
                document.createTextNode('фигня'),
                document.createTextNode('фииигггняяяя'),
            ],
            document.createTextNode('center фигня'),
            [
                document.createTextNode('b фигня'),
                document.createTextNode('b фииигггняяяя'),
            ]
        )
        
        return root_node
    }
    
    BashCUi.prototype.init = function(bash_c_cgi_bin_url) {
        this._bash_c_cgi_bin_url = bash_c_cgi_bin_url
        
        this._root_node = this._create_root_node()
    }
    
    function new_bash_c_ui(bash_c_cgi_bin_url) {
        var bash_c_ui = new BashCUi
        bash_c_ui.init(bash_c_cgi_bin_url)
        return bash_c_ui
    }
    
    BashCUi.prototype.show = function(target_id) {
        var target = document.getElementById(target_id)
        
        if(target && target.parentNode) {
            target.parentNode.replaceChild(this._root_node, target)
        }
    }
    
    function bash_c_bootstrap() {
        var script_params_ns = '/2011/02/19/bash_c_ui/params'
        var bash_c_cgi_bin_url = null
        
        head_params_iterate('bash_c_params', script_params_ns,
                function(node) {
                    func_tools.node_iterate(node, function(in_node) {
                        if(in_node.nodeType == Node.ELEMENT_NODE &&
                                in_node.localName == 'bash_c_cgi_bin_url' &&
                                in_node.namespaceURI == script_params_ns) {
                            bash_c_cgi_bin_url = in_node.getAttributeNS('', 'value')
                        } else if(in_node.nodeType == Node.ELEMENT_NODE &&
                                in_node.localName == 'bash_c_ui' &&
                                in_node.namespaceURI == script_params_ns) {
                            var target_id = in_node.getAttributeNS('', 'target_id')
                            
                            if(target_id && bash_c_cgi_bin_url) {
                                var bash_c_ui = new_bash_c_ui(bash_c_cgi_bin_url)
                                
                                bash_c_ui.show(target_id)
                            }
                        }
                    })
                })
    }
    
    function main(evt) {
        bash_c_bootstrap()
    }
    
    addEventListener('load', main, false)
})()


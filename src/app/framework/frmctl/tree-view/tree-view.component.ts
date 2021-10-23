import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';

interface ParentNode {
  name: string;
  value: string;
  children?: ParentNode[];
}

interface TreePropertyNode {
  expandable: boolean;
  name: string;
  value: string;
  level: number;
}

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css']
})
export class TreeViewComponent implements OnInit {

  @Input() treeObj: any;
  @Input() height: any;

  private transformer = (node: ParentNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      value: node.value,
      level: level
    };
  }

  treeControl = new FlatTreeControl<TreePropertyNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: TreePropertyNode) => node.expandable;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (Object.keys(this.treeObj).length) {
      this.createTree(this.treeObj);
    }
  }

  // create tree
  createTree(data) {
    let treeData = [];
    let ChildArray = [];
    let key: any;
    let object: any;
    let child: any;
    for (key in data) {
      if (data[key] instanceof Object) {
        ChildArray = [];
        object = {
          name: key,
          value: data[key][key]
        }
        for (child in data[key]) {
          var children = {
            name: child,
            value: data[key][child]
          }
          if (key != child) {
            ChildArray.push(children)
          }

        }
        object['children'] = ChildArray;
      } else {
        object = {
          name: key,
          value: data[key]
        }
      }
      treeData.push(object);
    }
    this.dataSource.data = treeData;
  }

}

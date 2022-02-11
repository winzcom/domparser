let f = `<game id="come">
<b>bold</b>
<ul>
  <li>there</li>
</ul>
</game>
<html id="diff" class="settings love">
<head>
<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.css" />
  <link rel="stylesheet" href="bower_components/angular-bootstrap-colorpicker/css/colorpicker.min.css" />
  <link rel="stylesheet" href="bower_components/ngprogress/ngProgress.css" />
  <link rel="stylesheet" href="bower_components/sweetalert/dist/sweetalert.css" />
  <link rel="stylesheet" href="https://vjs.zencdn.net/5.16.0/video-js.css" />
  <script src="https://vjs.zencdn.net/ie8/1.1.2/videojs-ie8.min.js"></script>
</head>
<body>
<div><span id="right-border">come live here</span>come out here
<lol></lol></div></body><jk><span id="span"/>jktest</jk></html>`

class Node {
  constructor() {
    this.parent = null
    this.children = []
    this.text = ''
    this.attributes = ''
    this.attri = {}
    this.tag
    this.end_at = 0
  }
  
  addChild(node) {
    this.children.push(node)
    return this
  }

  setAttributes() {
    if(!this.attributes) {
      return this
    }
    const ra = this.attributes
    let start = 0, eqp = 0, at = ''
    for(let i = 0; i < ra.length; i += 1) {
      if(ra[i] == '=') {
        at = ''
        eqp = i
        let beg = start
        while(eqp > beg) {
          at += ra[beg]
          beg += 1
        }
        this.attri[at] = ''
        start = i + 1
      } else if(ra[i] == ' ' || i + 1 >= ra.length) {
        let v = ''
        while(start <= i) {
          if(ra[start] == '"') {
            start += 1
            continue
          }
          v += ra[start]
          start += 1
        }
        this.attri[at] += v + ' '
        start = i + 1
      }
    }
  }

  getAttributes() {
    return this.attri
  }
  
  run(f, start, parent, closed_tag = false) {
    let opening = false, prev, value = [], text = ''
    let i = start
    while(i < f.length) {
      value = []
      //console.log({ ibase: i, line: 24 })
      if(f[i] == '\n') {
        i += 1
        continue
      }
      if(f[i] == '<') {
        opening = true
        closed_tag = false
        start = i
      } 
      else if(f[i] == '/' && prev == '<') {
        opening = false
      }
      else if(f[i] == '>') {
        if(!opening) {
          this.text = text
          this.end_at = i + 1
          return this
        }
        closed_tag = true
        let attribute_points = i
        for(let j = start + 1; j < i; j += 1) {
          if(f[j] !== ' ') {
            value.push(f[j])
          } else {
            attribute_points = j + 1
            break
          }
        }
        let newNode = new Node()
        newNode.tag = value.join('')
        this.addChild(newNode)
        newNode.parent = this
        if(attribute_points) {
          for(let k = attribute_points; k < i - 1; k += 1) {
            newNode.attributes += f[k]
          }
        }
        //set the attributes of the new Node
        newNode.setAttributes(i)
        if(prev == '/') {
          newNode.text = text
          console.log({ myparent: this.parent })
          newNode.end_at = i + 1
          ++i
          continue
        }
        newNode.run(f, i + 1, newNode, closed_tag)
        i = newNode.end_at
        start = i
        continue
      } else if(closed_tag) {
        text += f[i]
      }
      //console.log({ saf: this.text })
      prev = f[i]
      i += 1
    }
    return this
  }

  traverse() {
    console.log({ tag: this.tag, parent: this.parent?.tag, text: this.text, att: this.getAttributes() })
    for(let i = 0;  i < this.children.length; i += 1) {
      this.children[i].traverse()
    }
  }

  findById(id) {
    const queue = []
    queue.push(this)
    while(queue.length > 0) {
      let latest = queue.pop()
      const foundId = latest.attri['id']
      if(foundId && foundId.trim() == id) {
        return latest
      }
      const children = latest.children
      for(let i = 0; i < children.length; i += 1) {
        queue.push(children[i])
      }
    }
    return false
  }

  getParent() {
    if(this.parent.tag) {
      return this.parent
    }
    return
  }
}

class DomTree {
  constructor() {
    this.domElement = {}
    this.root = new Node()
    this.root.tag = null
  }

  run(f) {
    this.root.run(f, 0, this)
  }

  traverse() {
    this.root.traverse()
  }

  findById(id) {
    return this.root.findById(id)
  }
}

const dom = new DomTree()

dom.run(f)
dom.traverse()

//console.log({ idFound: dom.findById('right-border })


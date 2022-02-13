const fs = require('fs')

const content = fs.readFileSync('./k.html', {
  encoding:'utf8', flag: 'r'
})

const breaks = {
  br:true,
  input:true,
  link:true,
  meta:true
}

class Node {
  constructor() {
    this.parent = null
    this.children = []
    this.text = ''
    this.attributes = ''
    this.attri = {}
    this.unique_id
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
    //console.log({ start, line: 102, len: f[start], parent })
    let i = start, comment = false
    while(i < f.length) {
      value = []
      //console.log({ ibase: i, line: 24 })
      if(f[i] == '\n') {
        i += 1
        continue
      }
      if(!opening && f[i] == ' ') {
        i += 1
        continue
      }
      if(f[i] == '!' && prev == '<') {
        comment = true
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
        if(!comment) {
          this.addChild(newNode)
        }
        newNode.parent = this
        if(attribute_points) {
          for(let k = attribute_points; k < i - 1; k += 1) {
            newNode.attributes += f[k]
          }
        }
        //set the attributes of the new Node
        newNode.setAttributes(i)
        if(breaks[newNode.tag] || comment) {
          comment = false
          i += 1
          continue
        }
        if(prev == '/') {
          this.text = text
          //console.log({ myparent: this.parent })
          this.end_at = i + 1
          ++i
          continue
        }
        //console.log({ line: 128, jk: this.tag })
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
    this.end_at = i
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

  findTag(tag, tags = []) {
    const queue = []

    queue.push(this)

    while(queue.length > 0) {
      const latest = queue.pop()
      if (latest.tag == tag) {
        tags.push(latest)
      }
      for(let i = 0; i < latest.children.length; i += 1) {
        queue.push(latest.children[i])
      }
    }
    return tags
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

  findTag(tag){
    return this.root.findTag(tag)
  }

  traverse() {
    this.root.traverse()
  }

  findById(id) {
    return this.root.findById(id)
  }
}

const dom = new DomTree()

dom.run(content)
dom.traverse()

console.log(dom.findTag('body')[0].children.length)

//console.log({ idFound: dom.findById('right-border })


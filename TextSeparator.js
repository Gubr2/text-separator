//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
// *** TEXT SEPATARATOR by Adrián Gubrica, v1.5 *** //
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

////////////////// Notes ////////////////////

// ---> Not supported

// [] Adding classes, ids, attributes to the html elements inside the selector

// ---> Functions

// [] separate([array of strings to be marked]) - This functions is looking for the following attributes on parent text html elements:
//    * [data-separator="selector"] - Separates the text element to words and letters
//    * [data-separator="selector--line"] - Separates the text element to words and letters. Also, it marks the lines, and numbers them.

// [] getLinesCount() - This function returns the number of lines in text html element

export default class TextSeparator {
  constructor() {
    this.charactersToMark = []
  }

  //
  // HLAVNÉ FUNKCIE
  //

  separate(_charactersToMark, _customSelector) {
    if (_customSelector) {
      this.selector = []
      this.selectorLine = [...document.querySelectorAll(_customSelector)]
    } else {
      this.selector = [...document.querySelectorAll('[data-separator="selector"]')]
      this.selectorLine = [...document.querySelectorAll('[data-separator="selector--line"]')]
    }

    this.charactersToMark = []
    this.charactersToMark = _charactersToMark

    return new Promise((resolve) => {
      if (this.selector.length || this.selectorLine.length) {
        if (this.selector.length) {
          this.base(this.selector, false)
        }

        if (this.selectorLine.length) {
          this.base(this.selectorLine, true)

          // ---> Create Lines
          this.selectorLine.forEach((_item) => {
            this.addLinesToArray(_item)
            this.setLineStyle(_item)
          })
        }

        resolve()
      } else {
        console.warn('Text Separator: Please provide selector. ([data-separator="selector"] or [data-separator="selector--line"])')
      }
    })
  }

  base(_selector, _toLine) {
    _selector.forEach((_item) => {
      // 1. Vytvorenie stringu z jednotlivých selektorov
      this.string = _item.innerHTML
      // 2. Pridanie medzier za jednotlivé HTML elementy (<br>, <span>, <strong>, atď...)
      // ---> Za charakter "<"
      this.getHTMLElements(this.string, '<').forEach((_element, _index) => {
        this.string = this.string.substr(0, _element + _index) + ' ' + this.string.substr(_element + _index)
      })

      // ---> Za charakter ">"
      this.getHTMLElements(this.string, '>').forEach((_element, _index) => {
        this.string = this.string.substr(0, _element + _index + 1) + ' ' + this.string.substr(_element + _index + 1)
      })

      // 3. Odstránenie prázdnych medzier, ktoré vzniknú pri rozdelovaní slov
      this.wordsArray = this.cleanEmptySpaces(this.string.split(' '))

      // 4. Rozdelenie slov na písmená
      this.separateWordsIntoLetters(this.wordsArray)

      // 5. Pridanie span tagov pre písmená a slová
      this.addSpanToLetters(this.wordsArray)
      this.addSpanToWords(this.wordsArray, _toLine)

      // 6. Spojenie písmen v slovách
      this.joinLetters(this.wordsArray)

      // 7. Vloženie separovaného textu naspäť do HTML
      _item.innerHTML = this.wordsArray.join('')

      // 8. Naštýlovanie jednotlivých častí
      this.setStyles(_item)
    })
  }

  //
  // POMOCNÉ FUNKCIE
  //

  getHTMLElements(_string, _character) {
    this.index = [..._string.matchAll(new RegExp(_character, 'gi'))]

    this.elementIndexes = []

    this.index.forEach((_position) => {
      this.elementIndexes.push(_position.index)
    })

    return this.elementIndexes
  }

  cleanEmptySpaces(_wordsArray) {
    return _wordsArray.filter((n) => n)
  }

  separateWordsIntoLetters(_wordsArray) {
    _wordsArray.forEach((_word, _index) => {
      if (_word[0] !== '<') {
        _wordsArray[_index] = _word.split('')
      }
    })
  }

  addSpanToLetters(_wordsArray) {
    _wordsArray.forEach((_word, _index) => {
      if (_word[0] !== '<') {
        _word.forEach((_letter, _index) => {
          _word[_index] = `<span data-separator-letter>${_letter}</span>`
          if (this.charactersToMark.length > 0) {
            this.charactersToMark.forEach((_character) => {
              if (_letter == _character) {
                _word[_index] = `<span data-separator-letter="marked">${_letter}</span>`
              }
            })
          }
        })
      }
    })
  }

  addSpanToWords(_wordsArray, _toLine) {
    _wordsArray.forEach((_word, _index) => {
      if (_word[0] !== '<') {
        if (_toLine) {
          _word[0] = `<span data-separator-word-wrapper><span data-separator-word="line">${_word[0]}`
          _word[_word.length - 1] = `${_word[_word.length - 1]}</span></span> `
        } else {
          _word[0] = `<span data-separator-word-wrapper><span data-separator-word>${_word[0]}`
          _word[_word.length - 1] = `${_word[_word.length - 1]}</span></span> `
        }
      }
    })
  }

  joinLetters(_wordsArray) {
    _wordsArray.forEach((_word, _index) => {
      if (_word[0] !== '<') {
        _wordsArray[_index] = _word.join('')
      }
    })
  }

  //
  // LINES
  //

  addLinesToArray(_selector) {
    this.lineIndex = 0
    this.arrayForLines = []

    this.lineSelector = _selector
    this.lineSelectorToArray = Array.from(this.lineSelector.childNodes)

    this.arrayForLines[0] = new Array()

    this.lineSelectorToArray.forEach((_item, _index) => {
      this.followingIndex = _index + 2

      if (this.followingIndex > this.lineSelectorToArray.length - 1) {
        this.followingIndex = _index
      }

      this.arrayForLines[this.lineIndex].push(_item)

      if (this.isElement(_item)) {
        if (_item.offsetTop < this.lineSelectorToArray[this.followingIndex].offsetTop) {
          // console.log('now')
          this.lineIndex++
          this.arrayForLines[this.lineIndex] = new Array()
        }
      }
    })

    this.createLines(this.lineSelector, this.arrayForLines)
  }

  createLines(_selector, _array) {
    _array.forEach((_item) => {
      this.line = document.createElement('span')
      this.line.setAttribute('data-separator-line', '')

      _item.forEach((_element) => {
        this.line.appendChild(_element)
      })

      _selector.appendChild(this.line)
    })
  }

  isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument
  }

  // ---> Styles

  setStyles(_item) {
    // Selector
    _item.style.display = 'inline-block'

    // Word
    _item.querySelectorAll('[data-separator-word-wrapper').forEach((_word) => {
      _word.style.display = 'inline-block'
    })

    _item.querySelectorAll('[data-separator-word').forEach((_word) => {
      _word.style.display = 'inline-block'
    })

    // Letter
    _item.querySelectorAll('[data-separator-letter').forEach((_letter) => {
      _letter.style.display = 'inline-block'
    })
  }

  setLineStyle(_item) {
    // Line
    _item.querySelectorAll('[data-separator-line').forEach((_line) => {
      _line.style.display = 'inline-block'
    })
  }

  //
  // ZÍSKANIE POČTU RIADKOV
  //

  getLinesCount() {
    return this.lineIndex
  }
}

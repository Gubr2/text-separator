////////////////////
// ČO NEPODPORUJE //
////////////////////

// ---> Pridávanie classu, id alebo iného atribútu do HTML Elementov vnútri selektoras

export default class TextSeparator {
  constructor() {
    this.lineIndex = 0
  }

  //
  // HLAVNÉ FUNKCIE
  //

  separate() {
    this.selector = document.querySelectorAll('[data-separator="selector"]')
    this.selectorLine = document.querySelectorAll('[data-separator="selector--line"]')

    return new Promise((resolve) => {
      if (this.selector.length || this.selectorLine.length) {
        if (this.selector.length) {
          this.base(this.selector, false)
        }

        if (this.selectorLine.length) {
          this.base(this.selectorLine, true)
        }

        // ---> Create Lines

        if (this.selectorLine.length) {
          this.createLines()
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
        if (!_element) {
          this.string = this.string.substr(0, _element + _index) + ' ' + this.string.substr(_element + _index)
        } else {
          this.string = this.string.substr(0, _element + _index) + ' ' + this.string.substr(_element + _index)
        }
      })

      // ---> Za charakter ">"
      this.getHTMLElements(this.string, '>').forEach((_element, _index) => {
        if (!_element) {
          this.string = this.string.substr(0, _element + _index + 1) + ' ' + this.string.substr(_element + _index + 1)
        } else {
          this.string = this.string.substr(0, _element + _index + 1) + ' ' + this.string.substr(_element + _index + 1)
        }
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
          _word[_index] = `<span data-separator="letter">${_letter}</span>`
        })
      }
    })
  }

  addSpanToWords(_wordsArray, _toLine) {
    _wordsArray.forEach((_word, _index) => {
      if (_word[0] !== '<') {
        if (_toLine) {
          _word[0] = `<span data-separator="word--line">${_word[0]}`
          _word[_word.length - 1] = `${_word[_word.length - 1]}</span> `
        } else {
          _word[0] = `<span data-separator="word">${_word[0]}`
          _word[_word.length - 1] = `${_word[_word.length - 1]}</span> `
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

  createLines() {
    this.words = [...document.querySelectorAll('[data-separator="word--line"]')]

    this.followingIndex = 0

    this.words.forEach((_word, _index) => {
      this.followingIndex = _index + 1
      _word.setAttribute('data-separator-line', `${this.lineIndex}`)

      if (this.followingIndex > this.words.length - 1) {
        this.followingIndex = _index
      }

      if (_word.offsetTop < this.words[this.followingIndex].offsetTop) {
        this.lineIndex++
      }
    })
  }

  // ---> Styles

  setStyles(_item) {
    // Selector
    _item.style.display = 'inline-block'

    // Word
    _item.querySelectorAll('[data-separator="word"]').forEach((_word) => {
      _word.style.display = 'inline-block'
    })

    // Letter
    _item.querySelectorAll('[data-separator="letter"]').forEach((_letter) => {
      _letter.style.display = 'inline-block'
    })
  }

  //
  // ZÍSKANIE POČTU RIADKOV
  //

  getLinesCount() {
    return this.lineIndex
  }
}

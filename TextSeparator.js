////////////////////
// ČO NEPODPORUJE //
////////////////////

// ---> Pridávanie classu, id alebo iného atribútu do HTML Elementov vnútri selektora

export default class TextSeparate {
  constructor(_selector) {
    this.selector = _selector.name
    this.createLinesFlag = _selector.createLines

    this.separate()
  }

  //
  // HLAVNÁ FUNKCIA
  //

  separate() {
    return new Promise((resolve) => {
      this.selector.forEach((_item) => {
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
        this.addSpanToWords(this.wordsArray)

        // 6. Spojenie písmen v slovách
        this.joinLetters(this.wordsArray)

        // 7. Vloženie separovaného textu naspäť do HTML
        _item.innerHTML = this.wordsArray.join('')

        // 8. Naštýlovanie jednotlivých častí
        this.setStyles(_item)

        // 9. Vytvorenie riadkov (voliteľné)
        if (this.createLinesFlag) {
          // _item.innerHTML = this.createLines(_item)
          this.createLines(_item)
        }

        resolve()
      })
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
          _word[_index] = `<span data-separate="letter">${_letter}</span>`
        })
      }
    })
  }

  addSpanToWords(_wordsArray) {
    _wordsArray.forEach((_word, _index) => {
      if (_word[0] !== '<') {
        _word[0] = `<span data-separate="word">${_word[0]}`
        _word[_word.length - 1] = `${_word[_word.length - 1]}</span> `
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

  createLines(_item) {
    this.words = [..._item.querySelectorAll('[data-separate="word"]')]
    this.linesArray = []

    this.createLineDiv(this.words[0])

    this.words.forEach((_word, _index) => {
      this.followingIndex = _index + 1

      this.linesArray.push(_word.innerHTML)

      if (this.followingIndex > this.words.length - 1) {
        this.followingIndex = _index
      }

      if (_word.offsetLeft > this.words[this.followingIndex].offsetLeft) {
        this.linesArray.forEach((_wordInArray) => {
          document.querySelector('[data-separate="line"]').appendChild(_wordInArray)
        })

        this.linesArray = []
      }
    })

    // this.selectorWidth = _item.offsetWidth + _item.offsetLeft

    // this.newEl = document.createElement('div')

    // this.lineArray = []
    // this.newLineArray = []

    // this.words.forEach((_word, _index) => {
    //   if (_index && _word.offsetLeft < this.words[_index - 1].offsetLeft) {
    //     this.newLineArray.push(`<span data-separate="line">${this.lineArray.join('')}</span>`)

    //     this.lineArray = []
    //   } else {
    //     this.lineArray.push(_word.outerHTML)
    //   }

    //   if (_index == this.words.length - 1) {
    //     this.newLineArray.push(`<span data-separate="line">${this.lineArray.join('')}</span>`)

    //     this.lineArray = []
    //   }

    // if (this.wordFarPosition == this.selectorWidth) {
    //   console.log('Last')
    // }
    // })

    // return this.newLineArray.join('')
  }

  createLineDiv(_word) {
    _word.insertAdjacentHTML('beforebegin', '<span data-separate="line"></span>')
  }

  // ---> Styles

  setStyles(_item) {
    // Selector
    _item.style.display = 'inline-block'

    // Word
    _item.querySelectorAll('[data-separate="word"]').forEach((_word) => {
      _word.style.display = 'inline-block'
    })

    // Letter
    _item.querySelectorAll('[data-separate="letter"]').forEach((_letter) => {
      _letter.style.display = 'inline-block'
    })
  }
}

import { mountQuasar } from '@quasar/quasar-app-extension-testing-unit-jest'
import { QBtn, QCard, QSeparator, QSelect, QIcon, QToggle } from 'quasar' // <= cherry pick only the components you actually use
import ChordsFormatter from '../../../src/components/ChordsFormatter'
import store from '../../../src/store'

describe('ChordsFormatter', () => {
  test('mounts without errors', () => {
    const wrapper = mountQuasar(ChordsFormatter, {
      quasar: {
        components: {
          QBtn,
          QCard,
          QSeparator
        }
      },
      propsData: {
        prop1: 'value'
      }
    })

    expect(wrapper).toBeTruthy()
  })

  describe('Click on Valider', () => {
    const browseChords = jest.spyOn(ChordsFormatter.methods, 'browseChords')
    const wrapper = mountQuasar(ChordsFormatter, {
      mount: {
        type: 'full',
        store: store
      },
      quasar: {
        components: {
          QBtn,
          QCard,
          QSeparator,
          QSelect,
          QIcon,
          QToggle
        }
      }
    })
    // console.log(wrapper.vm)
    it('Click on "Valider"', async () => {
      const btn = (wrapper.findComponent({ ref: 'submitBtn' }))
      await btn.trigger('click')
      expect(browseChords).toBeCalled()
    })

    it('After click', () => {
      expect(browseChords).toHaveBeenCalled()
    })
    it('Check if result chords is filled', async () => {
      await new Promise((r) => setTimeout(r, 1000))
      expect(wrapper.vm.resultChords.length).not.toBe(0)
    })
  })
})

import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { extend, isEmpty } from 'lodash'
import { bindActionCreators } from 'redux'
import { Trans } from 'react-i18next'
import { isMobile } from 'react-device-detect'
import FontAwesome from 'react-fontawesome'

import { loadDB } from '../lib/db'
import Head from '../src/components/Head'
import LastExperiences from '../src/components/LastExperiences'
import config from '../utils/config'
import ExperiencesMap from '../src/components/Map/Experiences'
import { fetchMembers } from '../src/actions/TeamActions'
import { fetchExperiences } from '../src/actions/ExperienceActions'
import '../src/styles/experiences.scss'

class Error extends Component {
  state = {
    mobile: false,
    context: 'page',
    showTitle: true
  }

  constructor(props) {
    super(props)

    this.state.mobile = isMobile
  }

  static async getInitialProps({ isServer, res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null
    const app = await loadDB()
    const firestore = app.firestore()

    const promise = new Promise(async (resolve, reject) => {
      await firestore
        .collection('experiences')
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
          let data = []
          snapshot.forEach(function(doc) {
            data.push(extend({ id: doc.id }, doc.data()))
          })
          resolve(data)
        })
    })

    const { experiences } = await Promise.all([promise]).then(function([experiences]) {
      return { experiences }
    })

    return {
      experiences,
      statusCode
    }
  }

  componentWillMount = () => {
    const { i18n, lang } = this.props
    const commonData = require(`../src/locales/common`).default

    if (this.translateNS) {
      this.translateNS.forEach(element => {
        const data = require(`../src/locales/${element}`).default
        i18n.addResourceBundle(lang, element, data[lang])
      })
    }

    i18n.addResourceBundle(lang, 'common', commonData[lang])
    i18n.changeLanguage(lang)
  }

  render() {
    const { children, experiences, statusCode, i18n, lang } = this.props
    const { mobile, context, showTitle } = this.state

    const ContactUs = () => {
      return (
        <a href={`mailto:${config.email}`} className="Color--linkSecondary">
          {i18n.t('common:contact-us')}
        </a>
      )
    }

    return (
      <Fragment>
        <Head i18n={i18n} title={statusCode} />

        <div className="Experiences Block">
          <ExperiencesMap
            i18n={i18n}
            lang={lang}
            onMapClick={this.onMapClicked}
            isUserLogged={false}
            experiences={experiences}
          />
          {mobile && (
            <div className="Experiences-mapMobile">
              {context === 'map' && (
                <button
                  className="Experiences-mapMobileBack"
                  onClick={() => {
                    this.setState({ context: 'page' })
                  }}
                >
                  x
                </button>
              )}
              {context === 'page' && (
                <div className="Experiences-mapMobileDisclaimer">
                  <p className="Text Text--large">
                    <Trans
                      i18n={i18n}
                      i18nKey="experiences:navigate.map"
                      components={[<FontAwesome name="hand-pointer-o">.</FontAwesome>]}
                    />
                  </p>
                  <button
                    className="Button Button--action u-tSpace--m"
                    onClick={() => {
                      this.setState({ context: 'map' })
                    }}
                  >
                    {i18n.t('experiences:navigate.enable')}
                  </button>
                </div>
              )}
            </div>
          )}
          {children} {/*Header*/}
          {((mobile && context === 'page') || (!mobile && showTitle)) && (
            <div className="Block-content Paragraph Paragraph--centered u-tSpace--xxl js-title">
              <h2 className="Text Text--giant Text--strong Color--emphasis">{i18n.t('error:subtitle')}</h2>
              <p className="Text Text--large Color--paragraph u-tSpace--l">
                <Trans
                  i18n={i18n}
                  i18nKey="error:desc"
                  components={[<span className="Color--emphasis">{config.name}</span>]}
                />
              </p>
            </div>
          )}
          <div className="Breadcrumb Experiences-breadcrumb u-tSpace--xxl">
            <ul className="Breadcrumb-inner">
              <li className="Breadcrumb-item u-rSpace--xl">
                <Trans
                  i18n={i18n}
                  i18nKey="experiences:join"
                  components={[
                    <span className="Color--emphasis">{config.name}</span>,
                    <ContactUs>{i18n.t('common:contact-us')}</ContactUs>
                  ]}
                />{' '}
              </li>
            </ul>
          </div>
        </div>

        <LastExperiences i18n={i18n} lang={lang} limit={6} />
      </Fragment>
    )
  }
}

Error.prototype.translateNS = ['error', 'experiences']

Error.propTypes = {
  i18n: PropTypes.instanceOf(Object).isRequired,
  experiences: PropTypes.instanceOf(Array).isRequired,
  children: PropTypes.array.isRequired
}

function mapStateToProps(state, props) {
  return {
    members: isEmpty(state.members) ? props.members : state.members,
    experiences: isEmpty(state.experiences) ? props.experiences : state.experiences
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchMembers: bindActionCreators(fetchMembers, dispatch),
    fetchExperiences: bindActionCreators(fetchExperiences, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Error)

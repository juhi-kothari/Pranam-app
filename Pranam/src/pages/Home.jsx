import React, { useEffect } from 'react'
import NavBar from '../components/NavBar'
import Hero from '../components/Home/Hero'
import Pillars from '../components/Home/Pillars'
import VideoSection from '../components/Home/VideoSection'
import SeekerQuestions from '../components/Home/SeekerQuestions'
import DailyDelights from '../components/Home/DailyDelights'
import Publications from '../components/Home/Publications'
import Programmes from '../components/Home/Programmes'
import Moments from '../components/Home/Moments'
import Footer from '../components/Footer'
import Questions from '../components/Home/Questions'

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <NavBar></NavBar>
      <Hero></Hero>
      <Pillars></Pillars>
      <VideoSection></VideoSection>
      <SeekerQuestions></SeekerQuestions>
      <Publications></Publications>
      <DailyDelights></DailyDelights>
      <Questions></Questions>
      <Moments></Moments>
      <Programmes></Programmes>
      <Footer></Footer>
    </div>
  )
}

export default Home

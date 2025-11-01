import React, { useState , useEffect } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import dp from "../assets/Images/dp.png";

const comments = [
  { id: 1, name: "Deepika kaur", text: "Beautifully penned….we all need to awake from our slumber…." },
  { id: 2, name: "Riya Sharma", text: "Elegantly expressed... it's time for us to rise and shake off our complacency." },
];

const contributions = [
  {
    id: 1,
    title: "THE LANGUAGE OF SYMBOLS",
    date: "29-07-2012",
    author: "Meena Om",
    image: "https://picsum.photos/seed/symbols/800/400",
    description:
      "Recently I visited Kolkata after a hiatus of 6 years. Oh! Kolkata... How my heart pained seeing you. It seemed as if time has stopped in this city. Everything felt dull, stagnant, old and neglected.",
    article:
      "Recently I visited Kolkata after a hiatus of 6 years... (full article text here)",
  },
  {
    id: 2,
    title: "HOW TO LIVE IN DIVINE CONSCIOUSNESS?",
    date: "29-07-2012",
    author: "Meena Om",
    image: "https://picsum.photos/seed/divine/800/400",
    description:
      "A Butterfly spreading its silvery wings full of magical colors fluttering and dancing on the sweet scented flowers is an unforgettable sight. It etched a deep image in my mind remembering which frequently brings joy. ",
    article: "A Butterfly spreading its silvery wings... (full article text here)",
  },
  {
    id: 3,
    title: "EXPLORING THE ESSENCE OF DIVINE AWARENESS",
    date: "30-07-2012",
    author: "Meena Om",
    image: "https://picsum.photos/seed/awareness/800/400",
    description:
      "A dragonfly gliding gracefully over shimmering waters, its iridescent wings reflecting the sunlight, creates a mesmerizing spectacle. This enchanting moment is forever etched in my memory, a source of happiness that I often revisit.",
    article: "Exploring awareness in divine consciousness... (full article text here)",
  },
];

const BlogDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const post = location.state?.item;

  const [visibleCount] = useState(2);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!post) {
    return <div className="p-10 text-center">Post not found</div>;
  }

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        {/* Header Divider */}
        <div className="mb-5 h-[1px] bg-black"></div>
        <h2 className="text-2xl xl:text-4xl font-semibold uppercase tracking-wide text-[#5B575F] pb-2">
          Contributions by {post.author}
        </h2>
        <div className="mt-5 h-[1px] bg-black"></div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#BCC571] mb-2 mt-6 uppercase">
          {post.title}
        </h1>

        {/* Author + Date */}
        <p className="text-sm text-gray-500 mb-6 text-end">
          <span className="font-semibold">{post.author}</span> <br />• {post.date}
        </p>

        {/* Featured Image */}
        <img
          src={post.image}
          alt={post.title}
          className="rounded-[28px] mb-8 w-[1200px] h-[480px] object-cover"
        />

        {/* Article */}
        <div className="prose max-w-none text-[#737373] font-semibold leading-relaxed">
          <p>Recently I visited Kolkata after a hiatus of 6 years. Oh! Kolkata… How my heart pained seeing you. It seemed as if time has stopped in this city. Everything felt dull, stagnant, old and neglected. As if to validate my feelings, lining the streets like bored children seated in an equally uninspiring classroom, were yellow Ambassador car taxis. While the world has moved on from automatic vehicles to self-driven ones, Kolkata seemed to be caught in a time warp. Ambassadors have been phased out in the rest of India. They represent a grand past and mean a lot to those who had once owned and loved them, <span className="text-[#BCC571]">my family included. PNJ 17 was our epic car!</span>But today, these cars became metaphors for Kolkata and all that it had become.</p>
          <br />
          <p>A beautiful memory of the time gone by, much like this grand city that was once a commercial and cultural hub. A city that now seemed to be fraying at the edges, bleeding at the core and curling up as if trying to save shards of its golden past within its crumpled confines. Everywhere I looked, the same sight of neglect and apathy greeted me – piles of trash, flaking paint, and walls filled with rude algae. Each brick calling out to the passersby for help and renewal. The hand-pulled rickshaws and dilapidated trams represented a city that was trying to beat the onslaught of apathy and mis-management. It seemed to be fighting for survival.</p>
          <br />
          <p>The sky was overcast with ominous monsoon clouds. <span className="text-[#BCC571]">Their tears falling down in torrents, trying to wash out the feeling of pain, fear, anger and angst that appeared to be lurking in the hearts of the common citizens of Kolkata.</span> It felt as if Nature too was crying at what transpired on that dark August night at of the most premier medical institutes of the city.</p>
          <br />
          <p>Hoping for some divine intervention, I planned a morning visit to the Kali temple at Kalighat. Having visited the temple many times before, this time it was a sight of sheer neglect. After navigating through an unkept street, I stood in queue to enter the abode of Maa Kali. The pressure of the many people behind me was gradually mounting. Excited however, about the impending encounter, I silently chanted her favourite mantra, tuning myself to receive her darshan.</p>
          <br />
          <p>Suddenly a strong voice within asked me to step aside and not <span className="text-[#BCC571]">enter the temple.</span> As I tried to fend the feeling, assuming it to be just panic due to the hordes of people around, the voice became louder and louder. My feet froze, refusing to go further,  forcing me to obey the command and step away.  I turned back pushing my way through the narrow queue. My colleague, who was ahead of me decided to go for darshan so I agreed to stand in the periphery of the temple, awaiting her return.</p>
          <br />
          <p>And then in a flash I saw Maa. She had stepped out and was in a rage, standing vast, all encompassing, dancing over severed heads, her eyes flaming. <span className="text-[#BCC571]"> Now it was time for justice, hard, cold and impartial. No more warnings, no more signs, only action, was her message.</span></p>
          <br />
          <p>Trying to make sense of this very intense vision, my gaze moved away from the main temple towards the gate where a hapless black baby goat was tied to the rails. Disconcerted by the sight, and wondering why it was there, I glanced at the room next to her and saw the name ‘Bali Ghar’ – a place for offering animal sacrifices to the deity. The glassy look of surrender in the eyes of the kid, pained me. Even though just a baby, she knew that her fate was sealed…Sad that humans still needed to kill innocents to prove their might and devotion. Why not sacrifice the hypocrisy, greed and evil, lurking within? Kill the demons that spread darkness and ignorance, pain and terror instead. Annihilate all negativity that has engulfed humanity.</p>
          <br />
          <p>Everything seemed too commercial and mechanical. This was confirmed by my colleague who came out in a huff, upset at  how she was rudely forced to ‘pay up’ if she wanted a good darshan. A place of worship had become a place of business! Maa Kali, the resident deity of Kolkata, appeared to be held captive in her own home by some greedy people who had made a mockery out of all that she represents.
            So breaking the confines, she who is <span className="text-[#BCC571]">Mahakali</span>, the all-powerful one, had now taken a subtle yet vast form. She was furious. Her wrath was indicating that more strife to regain the perfect balance of Nature was expected. This was her land. And she will not have it any other way. The balance between Shiv, Shakti, truth and power has to be regained and she will not stop at anything less…
            The Ambassador car had to transform itself to a newer, contemporary version of itself, because change is the greatest law of Nature. Stagnancy leads to decay.  My mentor Meena Om ji often states that upheaval is essential for growth, survival, change and transformation. According to her, both Maa Kali and Shri Krishna consciousness are active now. So there will be chaos till the world emerges to welcome <span className="text-[#BCC571]">a new dawn of truth, love and genuineness.</span>  </p>
          <br />
          <p>Truth has to be stated as it is, like Maa Kali’s big protruding  tongue, not whispered in fear or apprehension, the way most people from the city were discussing that horrific incident — scared and completely helpless. Fearlessness needs to be the shield, for none can harm the one who has courage to cut through the many heads of falsehood, ego, greed and lust. Those who torment others should be punished. Isn’t it why Kali Maa wears a garland of skulls? Maybe Abhaya, the fearless one, the brave soul who gave up her life for all that is just, fair and true was her cryptic warning to all humanity.
            <br />Bengal the land of great revolutionaries, art and culture needs to reconnect to its roots. And as my taxi sped towards the airport, I realised that not too long ago, a great son of the soil, Swamy Vivekanand too had stated — “Arise awake and stop not till the goal is reached.”
          </p>
        </div>

        <div className="mt-12">
            <h2 className="text-2xl xl:text-4xl font-semibold mb-6">
              This Post Has {comments.length} Comments
            </h2>
            {comments.map((c) => (
              <div
                key={c.id}
                className="border rounded-2xl p-4 px-10 mb-4 bg-gradient-to-r from-white via-[#EFF1DD60] to-white shadow-md border-t-[#BCC571]"
              >
                <div className="flex items-center">
            <img
              src={dp}
              alt={c.name}
              className="w-8 h-8 rounded-full mr-4"
            />
            <p className="font-medium text-[#BCC571]">{c.name}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
            <p className="text-[#737373] font-semibold">{c.text}</p>
            <p className="text-end text-sm ml-4 whitespace-nowrap text-[#737373]">{c.name} <br />20-09-2024</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <h2 className="text-2xl lg:text-4xl font-semibold mb-6">Leave a Reply</h2>
            <div className="border rounded-2xl p-6 bg-gradient-to-r from-white via-[#EFF1DD60] to-white shadow-md border-t-[#BCC571]">
              <form className="space-y-4">
                <textarea
            rows="1"
            placeholder="Write your comment..."
            className="w-full border rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
                <div className="flex gap-4 flex-col md:flex-row">
            <input
              type="text"
              placeholder="Name *"
              className="flex-1 border rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="email"
              placeholder="Email *"
              className="flex-1 border rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5B575FAB]">
            <input type="checkbox" id="save-info" className="h-4 w-4" />
            <label htmlFor="save-info">Save my name, email, and website in this browser for the next time I comment.</label>
                </div>
                <div className="flex justify-end">
            <button
              type="button"
              className="text-white px-6 py-2 rounded-full shadow bg-[#BCC571]"
            >
              Post Comment
            </button>
                </div>
              </form>
            </div>
          </div>

          {/* Related Posts */}
        <div className="mt-16">
          <h2 className="text-2xl xl:text-4xl font-semibold mb-6">
            You Might Also Like
          </h2>
          <div className="space-y-10 mt-8">
            {contributions
              .filter((item) => item.id !== post.id)
              .slice(0, visibleCount)
              .map((item) => (
                <div key={item.id} className="pb-6">
                  <h2 className="text-lg md:text-3xl font-semibold mb-2 text-[#00000099]">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-3 text-end">
                    {item.author} <br /> {item.date}
                  </p>
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="rounded-md shadow-md w-full md:w-[400px] h-[260px] object-cover"
                    />
                    <div className="flex flex-col justify-end w-full">
                      <p className="text-[#737373] font-semibold mt-12 mb-3">{item.description}</p>
                        <Link
                          to={`/blog/${item.id}`}
                          state={{ item }}
                          className="bg-[#BCC571] text-white text-sm px-4 py-2 rounded-full shadow hover:bg-green-500 transition self-end"
                          >
                          Read More
                        </Link>
                      </div>
                  </div>
                  <div className="bg-[#000000] h-[1px] mt-8"></div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;

import { MapPin, Waves, Wind, Thermometer } from "lucide-react";

interface SpotCardProps {
  name: string;
  location: string;
  image: string;
  swell: string;
  wind: string;
  temp: string;
  rating: string;
}

const SpotCard = ({ name, location, image, swell, wind, temp, rating }: SpotCardProps) => {
  return (
    <div className="group glass-card rounded-2xl overflow-hidden hover:glow-primary transition-all duration-500 cursor-pointer">
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <span
          className={`absolute top-4 right-4 text-xs font-body font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
            rating === "Epic" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
          }`}
        >
          {rating}
        </span>
        <div className="absolute bottom-4 left-4">
          <h3 className="text-2xl font-display">{name}</h3>
          <p className="text-sm text-muted-foreground font-body flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" /> {location}
          </p>
        </div>
      </div>
      <div className="p-5 grid grid-cols-3 gap-3">
        {[
          { icon: Waves, label: "Swell", value: swell },
          { icon: Wind, label: "Wind", value: wind },
          { icon: Thermometer, label: "Temp", value: temp },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <item.icon className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{item.label}</p>
            <p className="text-sm font-body font-medium mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpotCard;

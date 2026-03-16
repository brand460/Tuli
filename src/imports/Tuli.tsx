import clsx from "clsx";
import svgPaths from "./svg-6kcz9bcxky";
import imgImage6 from "figma:asset/4b1fe1f5dbc3dbbc98b93791f2e9e9695d69dae1.png";

function IconBase({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute left-[11.99px] size-[23.992px] top-[11.99px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9916 23.9916">
        {children}
      </svg>
    </div>
  );
}

function Button1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-[rgba(255,255,255,0.8)] relative rounded-[36410900px] shrink-0 size-[31.994px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[8.003px] relative size-full">{children}</div>
    </div>
  );
}

function Icon3({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[19.99px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9901 19.9901">
        {children}
      </svg>
    </div>
  );
}
type Icon2Props = {
  additionalClassNames?: string;
};

function Icon2({ children, additionalClassNames = "" }: React.PropsWithChildren<Icon2Props>) {
  return (
    <div className={clsx("size-[15.989px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9887 15.9887">
        {children}
      </svg>
    </div>
  );
}
type Wrapper4Props = {
  additionalClassNames?: string;
};

function Wrapper4({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper4Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type ButtonProps = {
  additionalClassNames?: string;
};

function Button({ children, additionalClassNames = "" }: React.PropsWithChildren<ButtonProps>) {
  return (
    <div className={clsx("relative rounded-[36410900px] shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[6.002px] relative size-full">{children}</div>
    </div>
  );
}
type Wrapper3Props = {
  additionalClassNames?: string;
};

function Wrapper3({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper3Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">{children}</div>
    </div>
  );
}
type Wrapper2Props = {
  additionalClassNames?: string;
};

function Wrapper2({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper2Props>) {
  return <Wrapper3 additionalClassNames={clsx("h-[20.007px] relative shrink-0", additionalClassNames)}>{children}</Wrapper3>;
}

function Icon1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[11.987px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9873 11.9873">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper2>
      <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[0] relative shrink-0 text-[#4a4a45] text-[0px] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        {children}
      </p>
    </Wrapper2>
  );
}

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[19.99px] overflow-clip relative shrink-0 w-full">
      <div className="absolute inset-[8.33%_8.33%_12.2%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5.24%_-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3258 17.5514">
            {children}
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <Wrapper>
      <path d={svgPaths.p24f0c9f2} fill="var(--fill-0, #6FBD85)" id="Vector" stroke="var(--stroke-0, #6FBD85)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
    </Wrapper>
  );
}
type TextText1Props = {
  text: string;
  additionalClassNames?: string;
};

function TextText1({ text, additionalClassNames = "" }: TextText1Props) {
  return (
    <Wrapper3 additionalClassNames={clsx("h-[16.006px] relative shrink-0", additionalClassNames)}>
      <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[16px] relative shrink-0 text-[#4a9b65] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        {text}
      </p>
    </Wrapper3>
  );
}
type HeadingTextProps = {
  text: string;
};

function HeadingText({ text }: HeadingTextProps) {
  return (
    <div className="h-[24.009px] relative shrink-0 w-full">
      <p className="absolute font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[24px] left-0 text-[#1a1a18] text-[16px] top-[0.09px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        {text}
      </p>
    </div>
  );
}
type TextTextProps = {
  text: string;
  additionalClassNames?: string;
};

function TextText({ text, additionalClassNames = "" }: TextTextProps) {
  return (
    <Wrapper1 additionalClassNames={additionalClassNames}>
      <span className="leading-[20px]">{`1 `}</span>
      <span className="font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[20px]" style={{ fontVariationSettings: "'opsz' 9" }}>
        {text}
      </span>
    </Wrapper1>
  );
}

export default function Tuli() {
  return (
    <div className="bg-white relative size-full" data-name="Tuli">
      <div className="absolute bg-white h-[851.828px] left-0 top-0 w-[1026.534px]" data-name="sC" />
      <div className="absolute bg-[#f7f7f5] content-stretch flex flex-col h-[851.828px] items-start left-0 overflow-clip top-0 w-[1026.534px]" data-name="MainShell">
        <div className="h-[787.839px] relative shrink-0 w-full" data-name="Container">
          <div className="absolute content-stretch flex flex-col h-[787.839px] items-start left-0 overflow-clip top-0 w-[1026.534px]" data-name="Container">
            <div className="flex-[1_0_0] min-h-px min-w-px relative w-[1026.534px]" data-name="RecipeDetailView">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                <div className="absolute h-[567.845px] left-0 overflow-clip top-[219.99px] w-[1026.534px]" data-name="Container">
                  <div className="absolute content-stretch flex flex-col gap-[7.986px] h-[243px] items-start left-[24px] top-[40.01px] w-[146px]" data-name="Container">
                    <div className="h-[48px] relative shrink-0 w-[146px]" data-name="Container">
                      <div className="content-stretch flex flex-col items-start justify-between pr-[934.518px] relative size-full">
                        <p className="font-['DM_Sans:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#1a1a18] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
                          Zutaten
                        </p>
                        <div className="h-[23.992px] relative shrink-0 w-[139.948px]" data-name="Container">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.986px] items-center relative size-full">
                            <Button additionalClassNames="bg-[#f0f0ed] size-[23.992px]">
                              <Icon1>
                                <path d="M2.49735 5.99365H9.48995" id="Vector" stroke="var(--stroke-0, #4A4A45)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.998942" />
                              </Icon1>
                            </Button>
                            <Wrapper2 additionalClassNames="w-[75.993px]">
                              <p className="font-['DM_Sans:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#1a1a18] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
                                4 Portionen
                              </p>
                            </Wrapper2>
                            <Button additionalClassNames="bg-[#f0f0ed] size-[23.992px]">
                              <Icon1>
                                <path d="M2.49735 5.99365H9.48995" id="Vector" stroke="var(--stroke-0, #4A4A45)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.998942" />
                                <path d="M5.99365 2.49735V9.48995" id="Vector_2" stroke="var(--stroke-0, #4A4A45)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.998942" />
                              </Icon1>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col gap-[5.985px] h-[149.968px] items-start relative shrink-0 w-full" data-name="Container">
                      <div className="content-stretch flex gap-[7.986px] h-[20.007px] items-center relative shrink-0 w-full" data-name="Container">
                        <div className="bg-[#6fbd85] rounded-[36410900px] shrink-0 size-[5.985px]" data-name="Text" />
                        <Wrapper1 additionalClassNames="w-[73.941px]">
                          <span className="leading-[20px]">{`195 `}</span>
                          <span className="font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[20px]" style={{ fontVariationSettings: "'opsz' 9" }}>
                            gr mehl
                          </span>
                        </Wrapper1>
                      </div>
                      <div className="content-stretch flex gap-[7.986px] h-[20.007px] items-center relative shrink-0 w-full" data-name="Container">
                        <div className="bg-[#6fbd85] rounded-[36410900px] shrink-0 size-[5.985px]" data-name="Text" />
                        <Wrapper1 additionalClassNames="w-[72.789px]">
                          <span className="leading-[20px]">{`2 `}</span>
                          <span className="font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[20px]" style={{ fontVariationSettings: "'opsz' 9" }}>
                            TL zucker
                          </span>
                        </Wrapper1>
                      </div>
                      <div className="content-stretch flex gap-[7.986px] h-[20.007px] items-center relative shrink-0 w-full" data-name="Container">
                        <div className="bg-[#6fbd85] rounded-[36410900px] shrink-0 size-[5.985px]" data-name="Text" />
                        <TextText text="TL Backpulver" additionalClassNames="w-[98.357px]" />
                      </div>
                      <div className="content-stretch flex gap-[7.986px] h-[20.007px] items-center relative shrink-0 w-full" data-name="Container">
                        <div className="bg-[#6fbd85] rounded-[36410900px] shrink-0 size-[5.985px]" data-name="Text" />
                        <TextText text="TL Salz" additionalClassNames="w-[52.442px]" />
                      </div>
                      <div className="content-stretch flex gap-[7.986px] h-[20.007px] items-center relative shrink-0 w-full" data-name="Container">
                        <div className="bg-[#6fbd85] rounded-[36410900px] shrink-0 size-[5.985px]" data-name="Text" />
                        <Wrapper1 additionalClassNames="w-[84.878px]">
                          <span className="leading-[20px]">{`300 `}</span>
                          <span className="font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[20px]" style={{ fontVariationSettings: "'opsz' 9" }}>
                            ml Milch
                          </span>
                        </Wrapper1>
                      </div>
                      <div className="content-stretch flex gap-[7.986px] h-[20.007px] items-center relative shrink-0 w-full" data-name="Container">
                        <div className="bg-[#6fbd85] rounded-[36410900px] shrink-0 size-[5.985px]" data-name="Text" />
                        <TextText text="Eier" additionalClassNames="w-[32.605px]" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute content-stretch flex flex-col gap-[7.986px] h-[193px] items-start left-[262px] top-[40.01px] w-[740px]" data-name="Container">
                    <HeadingText text="Zubereitung" />
                    <div className="content-stretch flex flex-col gap-[11.987px] h-[144.187px] items-start relative shrink-0 w-full" data-name="Container">
                      <div className="content-stretch flex gap-[11.987px] h-[25.975px] items-start relative shrink-0 w-full" data-name="Container">
                        <div className="bg-[#ebf7ef] relative rounded-[36410900px] shrink-0 size-[23.992px]" data-name="Container">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[9.715px] pr-[9.732px] relative size-full">
                            <TextText1 text="1" additionalClassNames="w-[4.544px]" />
                          </div>
                        </div>
                        <Wrapper4 additionalClassNames="h-[25.975px] w-[301.819px]">
                          <p className="absolute font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[22.75px] left-0 text-[#4a4a45] text-[14px] top-[-0.91px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 9" }}>
                            melt the butter and set it aside to cool slightly.
                          </p>
                        </Wrapper4>
                      </div>
                      <div className="content-stretch flex gap-[11.987px] items-start relative shrink-0 w-full" data-name="Container">
                        <div className="bg-[#ebf7ef] relative rounded-[36410900px] shrink-0 size-[23.992px]" data-name="Container">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[8.478px] pr-[8.495px] relative size-full">
                            <TextText1 text="2" additionalClassNames="w-[7.019px]" />
                          </div>
                        </div>
                        <Wrapper4 additionalClassNames="h-[43px] w-[712px]">
                          <p className="absolute font-['DM_Sans:9pt_Regular',sans-serif] font-normal h-[44px] leading-[22.75px] left-[0.02px] text-[#4a4a45] text-[14px] top-[-0.96px] w-[712px]" style={{ fontVariationSettings: "'opsz' 9" }}>
                            In a separate bowl, whisk together the milk, egg, melted butter, and vanilla extract. Don’t worry if the butter solidifies a little.
                          </p>
                        </Wrapper4>
                      </div>
                      <div className="content-stretch flex gap-[11.987px] h-[68.261px] items-start relative shrink-0 w-full" data-name="Container">
                        <div className="bg-[#ebf7ef] relative rounded-[36410900px] shrink-0 size-[23.992px]" data-name="Container">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[8.342px] relative size-full">
                            <TextText1 text="3" additionalClassNames="w-[7.308px]" />
                          </div>
                        </div>
                        <Wrapper4 additionalClassNames="h-[68.261px] w-[958.577px]">
                          <p className="absolute font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[22.75px] left-[0.02px] text-[#4a4a45] text-[14px] top-[-0.92px] w-[712px]" style={{ fontVariationSettings: "'opsz' 9" }}>
                            Create a well in the center of your dry ingredients. Pour the milk mixture into the well and gently whisk until the flour is just incorporated. A few small lumps are perfectly normal. As the batter rests, you should see it begin to bubble. It will be thick, like cake batter. If it seems too thick, add a splash more milk to thin it out.
                          </p>
                        </Wrapper4>
                      </div>
                    </div>
                  </div>
                  <div className="absolute content-stretch flex flex-col gap-[7.986px] h-[123px] items-start left-[262px] top-[273.01px] w-[740px]" data-name="Container">
                    <HeadingText text="Kommentare" />
                    <div className="bg-[#f0f0ed] h-[84.488px] relative rounded-[14px] shrink-0 w-full" data-name="Text Area">
                      <div className="overflow-clip rounded-[inherit] size-full">
                        <div className="content-stretch flex items-start px-[12px] py-[8px] relative size-full">
                          <p className="font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[22.857px] relative shrink-0 text-[16px] text-[rgba(26,26,24,0.5)] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 9" }}>
                            Eigene Notizen...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute h-[20.007px] left-[15.99px] top-[677.16px] w-[124.23px]" data-name="Button">
                    <Icon2 additionalClassNames="absolute left-0 top-[2px]">
                      <g clipPath="url(#clip0_157_2067)" id="Icon">
                        <path d="M1.99859 3.99718H13.9901" id="Vector" stroke="var(--stroke-0, #DC2626)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33239" />
                        <path d={svgPaths.p2701e880} id="Vector_2" stroke="var(--stroke-0, #DC2626)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33239" />
                        <path d={svgPaths.p13366580} id="Vector_3" stroke="var(--stroke-0, #DC2626)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33239" />
                        <path d="M6.66197 7.32816V11.3253" id="Vector_4" stroke="var(--stroke-0, #DC2626)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33239" />
                        <path d="M9.32675 7.32816V11.3253" id="Vector_5" stroke="var(--stroke-0, #DC2626)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33239" />
                      </g>
                      <defs>
                        <clipPath id="clip0_157_2067">
                          <rect fill="white" height="15.9887" width="15.9887" />
                        </clipPath>
                      </defs>
                    </Icon2>
                    <p className="-translate-x-1/2 absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[20px] left-[73.97px] text-[#dc2626] text-[14px] text-center top-[-1px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>{` Rezept löschen`}</p>
                  </div>
                </div>
                <div className="absolute h-[219.993px] left-0 top-0 w-[1026.534px]" data-name="Container">
                  <div className="absolute h-[219.993px] left-0 overflow-clip top-0 w-[1026.534px]" data-name="ImageWithFallback">
                    <div className="absolute h-[218px] left-0 top-0 w-[433px]" data-name="image 6">
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img alt="" className="absolute h-[104.77%] left-[-1.97%] max-w-none top-[-3.86%] w-[104.43%]" src={imgImage6} />
                      </div>
                    </div>
                    <div className="absolute h-[96px] left-[493px] top-[61px] w-[256px]">
                      <div className="absolute content-stretch flex h-[31.977px] items-start left-0 top-0 w-[994.556px]" data-name="Heading 1">
                        <p className="flex-[1_0_0] font-['DM_Sans:Bold',sans-serif] font-bold leading-[32px] min-h-px min-w-px relative text-[#1a1a18] text-[24px]" style={{ fontVariationSettings: "'opsz' 14" }}>
                          Pancakes
                        </p>
                      </div>
                      <div className="absolute h-[19.99px] left-0 top-[39.96px] w-[994.556px]" data-name="Container">
                        <div className="absolute content-stretch flex flex-col items-start left-0 size-[19.99px] top-0" data-name="Button">
                          <Icon />
                        </div>
                        <div className="absolute content-stretch flex flex-col items-start left-[23.97px] size-[19.99px] top-0" data-name="Button">
                          <Icon />
                        </div>
                        <div className="absolute content-stretch flex flex-col items-start left-[47.95px] size-[19.99px] top-0" data-name="Button">
                          <Icon />
                        </div>
                        <div className="absolute content-stretch flex flex-col items-start left-[71.92px] size-[19.99px] top-0" data-name="Button">
                          <Icon />
                        </div>
                        <div className="absolute content-stretch flex flex-col items-start left-[95.9px] size-[19.99px] top-0" data-name="Button">
                          <Wrapper>
                            <path d={svgPaths.p24f0c9f2} id="Vector" stroke="var(--stroke-0, #9A9A93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
                          </Wrapper>
                        </div>
                        <div className="absolute h-[19.973px] left-[131.86px] top-0 w-[81.707px]" data-name="Container">
                          <div className="absolute bg-[#ebf7ef] h-[19.973px] left-0 rounded-[36410900px] top-0 w-[81.707px]" data-name="Text">
                            <p className="absolute font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[16px] left-[7.99px] text-[#4a9b65] text-[12px] top-[1.98px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 9" }}>
                              Vegetarisch
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute content-stretch flex h-[23.992px] items-center left-0 top-[71.94px] w-[994.556px]" data-name="Container">
                        <Wrapper4 additionalClassNames="h-[20.007px] w-[66.244px]">
                          <Icon2 additionalClassNames="absolute left-0 top-[2px]">
                            <g clipPath="url(#clip0_157_2061)" id="Icon">
                              <path d={svgPaths.p10ffc380} id="Vector" stroke="var(--stroke-0, #4A4A45)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33239" />
                              <path d={svgPaths.p3d500400} id="Vector_2" stroke="var(--stroke-0, #4A4A45)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33239" />
                            </g>
                            <defs>
                              <clipPath id="clip0_157_2061">
                                <rect fill="white" height="15.9887" width="15.9887" />
                              </clipPath>
                            </defs>
                          </Icon2>
                          <p className="absolute font-['DM_Sans:9pt_Regular',sans-serif] font-normal leading-[20px] left-[19.97px] text-[#4a4a45] text-[14px] top-[-1px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 9" }}>{` 25 Min.`}</p>
                        </Wrapper4>
                      </div>
                    </div>
                  </div>
                  <div className="absolute content-stretch flex h-[31.994px] items-center justify-between left-[11.99px] top-[11.99px] w-[1002.559px]" data-name="Container">
                    <Button additionalClassNames="bg-[rgba(255,255,255,0.8)] size-[31.994px]">
                      <Icon3>
                        <g id="Icon">
                          <path d={svgPaths.p2432f400} id="Vector" stroke="var(--stroke-0, #4A4A45)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
                        </g>
                      </Icon3>
                    </Button>
                    <div className="h-[31.994px] relative shrink-0 w-[71.975px]" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.986px] items-start relative size-full">
                        <Button1>
                          <Icon2 additionalClassNames="relative shrink-0">
                            <g clipPath="url(#clip0_157_2026)" id="Icon">
                              <path d={svgPaths.p1bea4d00} id="Vector" stroke="var(--stroke-0, #4A4A45)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33239" />
                            </g>
                            <defs>
                              <clipPath id="clip0_157_2026">
                                <rect fill="white" height="15.9887" width="15.9887" />
                              </clipPath>
                            </defs>
                          </Icon2>
                        </Button1>
                        <Button1>
                          <Icon2 additionalClassNames="relative shrink-0">
                            <g clipPath="url(#clip0_157_2037)" id="Icon">
                              <path d={svgPaths.p3eae9e00} id="Vector" stroke="var(--stroke-0, #4A4A45)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33239" />
                              <path d={svgPaths.p237a3000} id="Vector_2" stroke="var(--stroke-0, #4A4A45)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33239" />
                            </g>
                            <defs>
                              <clipPath id="clip0_157_2037">
                                <rect fill="white" height="15.9887" width="15.9887" />
                              </clipPath>
                            </defs>
                          </Icon2>
                        </Button1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#6fbd85] content-stretch flex items-center justify-center left-[958.56px] pl-[15.989px] pr-[16.006px] rounded-[25.992px] size-[51.985px] top-[647.86px]" data-name="RecipeDetailView">
        <Icon3>
          <g clipPath="url(#clip0_157_2029)" id="Icon">
            <path d="M6.66338 1.66584V4.99753" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
            <path d="M13.3268 1.66584V4.99753" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
            <path d={svgPaths.p12e7dd00} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
            <path d="M2.49877 8.32922H17.4914" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
            <path d="M13.3268 15.8255H18.3243" id="Vector_5" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
            <path d="M15.8255 13.3268V18.3243" id="Vector_6" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
          </g>
          <defs>
            <clipPath id="clip0_157_2029">
              <rect fill="white" height="19.9901" width="19.9901" />
            </clipPath>
          </defs>
        </Icon3>
      </div>
      <div className="absolute bg-[#6fbd85] content-stretch flex items-center justify-center left-[958.56px] pl-[15.989px] pr-[16.006px] rounded-[25.992px] size-[51.985px] top-[711.85px]" data-name="RecipeDetailView">
        <Icon3>
          <g clipPath="url(#clip0_157_2021)" id="Icon">
            <path d={svgPaths.p34b29220} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
            <path d={svgPaths.p2801e580} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
            <path d={svgPaths.p2bdc2c80} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66584" />
          </g>
          <defs>
            <clipPath id="clip0_157_2021">
              <rect fill="white" height="19.9901" width="19.9901" />
            </clipPath>
          </defs>
        </Icon3>
      </div>
      <div className="absolute bg-white content-stretch flex flex-col h-[65.04px] items-start left-0 pl-[173.265px] pr-[173.282px] pt-[1.085px] top-[786.79px] w-[1026.534px]" data-name="MainShell">
        <div aria-hidden="true" className="absolute border-[#e8e8e3] border-solid border-t-[1.085px] inset-0 pointer-events-none" />
        <div className="h-[63.955px] relative shrink-0 w-full" data-name="Container">
          <div className="absolute left-[50.39px] size-[47.983px] top-[7.99px]" data-name="Button">
            <IconBase>
              <g clipPath="url(#clip0_157_2014)" id="IconBase">
                <g id="Vector" />
                <path d={svgPaths.p3a98e980} id="Vector_2" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d={svgPaths.p841b700} id="Vector_3" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d={svgPaths.p3c250780} id="Vector_4" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d={svgPaths.p14f2ff00} id="Vector_5" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
              </g>
              <defs>
                <clipPath id="clip0_157_2014">
                  <rect fill="white" height="23.9916" width="23.9916" />
                </clipPath>
              </defs>
            </IconBase>
            <div className="absolute bg-[#6fbd85] left-[32.01px] rounded-[3.993px] size-[7.986px] top-[7.99px]" data-name="Text" />
          </div>
          <div className="absolute left-[183.18px] size-[47.983px] top-[7.99px]" data-name="Button">
            <IconBase>
              <g clipPath="url(#clip0_157_2041)" id="IconBase">
                <g id="Vector" />
                <path d={svgPaths.p19575400} id="Vector_2" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d="M16.4942 2.24921V5.24815" id="Vector_3" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d="M7.49736 2.24921V5.24815" id="Vector_4" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d="M3.74868 8.2471H20.2429" id="Vector_5" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d={svgPaths.p8bb6caa} id="Vector_6" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d={svgPaths.pd913200} id="Vector_7" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
              </g>
              <defs>
                <clipPath id="clip0_157_2041">
                  <rect fill="white" height="23.9916" width="23.9916" />
                </clipPath>
              </defs>
            </IconBase>
          </div>
          <div className="absolute left-[315.98px] size-[47.983px] top-[7.99px]" data-name="Button">
            <IconBase>
              <g clipPath="url(#clip0_157_2005)" id="IconBase">
                <g id="Vector" />
                <path d="M8.99683 11.9958H14.9947" id="Vector_2" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d="M8.99683 14.9947H14.9947" id="Vector_3" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d={svgPaths.p1770cf00} id="Vector_4" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d="M7.49736 2.24921V5.24815" id="Vector_5" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d="M11.9958 2.24921V5.24815" id="Vector_6" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d="M16.4942 2.24921V5.24815" id="Vector_7" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
              </g>
              <defs>
                <clipPath id="clip0_157_2005">
                  <rect fill="white" height="23.9916" width="23.9916" />
                </clipPath>
              </defs>
            </IconBase>
          </div>
          <div className="absolute left-[448.77px] size-[47.983px] top-[7.99px]" data-name="Button">
            <div className="absolute bg-[#6fbd85] h-[32px] left-[1.99px] opacity-15 rounded-[36410900px] top-[7.99px] w-[44px]" data-name="Container" />
            <IconBase>
              <g clipPath="url(#clip0_157_2001)" id="IconBase">
                <g id="Vector" />
                <path d={svgPaths.p3a39ad00} fill="var(--fill-0, #1A1A1A)" id="Vector_2" />
              </g>
              <defs>
                <clipPath id="clip0_157_2001">
                  <rect fill="white" height="23.9916" width="23.9916" />
                </clipPath>
              </defs>
            </IconBase>
          </div>
          <div className="absolute left-[581.56px] size-[47.983px] top-[7.99px]" data-name="Button">
            <IconBase>
              <g clipPath="url(#clip0_157_2050)" id="IconBase">
                <g id="Vector" />
                <path d="M3.74868 11.9958H20.2429" id="Vector_2" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d="M3.74868 5.99789H20.2429" id="Vector_3" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
                <path d="M3.74868 17.9937H20.2429" id="Vector_4" stroke="var(--stroke-0, #1A1A1A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49947" />
              </g>
              <defs>
                <clipPath id="clip0_157_2050">
                  <rect fill="white" height="23.9916" width="23.9916" />
                </clipPath>
              </defs>
            </IconBase>
          </div>
        </div>
      </div>
    </div>
  );
}